import { format } from "date-fns";
import { bgLocale } from "@/src/i18n/format";

import type { ProjectWorkspace } from "@/features/projects/types/project-workspace";
import type { StudioCapacityPlan } from "@/features/planner/types/capacity-plan";
import {
  calculateAvailableHours,
  calculateDailyCapacityHours,
  calculateLoad,
} from "@/features/planner/capacity";
import type {
  TodayCapacitySummary,
  TodayNextTask,
  TodayView,
  TodayWaitingItem,
} from "@/features/today/types/today-view";
import type { TaskStatus } from "@/features/tasks/types/task";

const TASK_STATUS_PRIORITY: TaskStatus[] = [
  "in_progress",
  "scheduled",
  "blocked",
  "backlog",
  "done",
];

const WAITING_CATEGORY_PRIORITY = [
  "blocked_phase",
  "client_approval",
  "supplier_waiting",
] as const;

interface BuildTodayViewInput {
  workspaces: ProjectWorkspace[];
  capacityPlan: StudioCapacityPlan;
  referenceDate?: Date;
}

export function buildTodayView(input: BuildTodayViewInput): TodayView {
  const referenceDate = input.referenceDate ?? new Date();
  const todayTasks = collectTodayTasks(input.workspaces);
  const waitingItems = collectWaitingItems(input.workspaces);
  const plannedHours = input.workspaces.reduce(
    (total, workspace) => total + workspace.capacity_hours_today,
    0
  );

  return {
    date_label: format(referenceDate, "EEEE, d MMMM yyyy", { locale: bgLocale }),
    active_project_count: input.workspaces.length,
    next_task: pickNextTask(todayTasks),
    waiting_items: waitingItems,
    capacity: buildCapacitySummary(plannedHours, input.capacityPlan),
  };
}

function collectTodayTasks(workspaces: ProjectWorkspace[]): TodayNextTask[] {
  return workspaces.flatMap((workspace) =>
    workspace.today_tasks.map((task) => ({
      id: task.id,
      title: task.title,
      project_id: workspace.id,
      project_name: workspace.name,
      client_display_name: workspace.client_display_name,
      room_name: task.room_name,
      phase_label: task.phase_label,
      estimated_hours: task.estimated_hours,
      status: task.status,
      status_label: task.status_label,
    }))
  );
}

function collectWaitingItems(workspaces: ProjectWorkspace[]): TodayWaitingItem[] {
  const items = workspaces.flatMap((workspace) =>
    workspace.waiting_items.map((item) => ({
      id: `${workspace.id}-${item.id}`,
      category: item.category,
      title: item.title,
      context: item.context,
      room_name: item.room_name,
      project_id: workspace.id,
      project_name: workspace.name,
    }))
  );

  return items
    .sort((left, right) => {
      const leftPriority = WAITING_CATEGORY_PRIORITY.indexOf(left.category);
      const rightPriority = WAITING_CATEGORY_PRIORITY.indexOf(right.category);

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }

      return left.project_name.localeCompare(right.project_name, "bg");
    })
    .slice(0, 8);
}

function pickNextTask(tasks: TodayNextTask[]): TodayNextTask | null {
  if (tasks.length === 0) {
    return null;
  }

  return [...tasks].sort((left, right) => {
    const leftPriority = TASK_STATUS_PRIORITY.indexOf(left.status);
    const rightPriority = TASK_STATUS_PRIORITY.indexOf(right.status);

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return right.estimated_hours - left.estimated_hours;
  })[0];
}

function buildCapacitySummary(
  plannedHours: number,
  capacityPlan: StudioCapacityPlan
): TodayCapacitySummary {
  const dailyCapacityHours = calculateDailyCapacityHours(
    capacityPlan.weekly_capacity_hours
  );
  const loadPercent = calculateLoad(plannedHours, dailyCapacityHours);

  return {
    planned_hours: plannedHours,
    daily_capacity_hours: dailyCapacityHours,
    available_hours: calculateAvailableHours(plannedHours, dailyCapacityHours),
    load_percent: loadPercent,
    is_over_capacity: plannedHours > dailyCapacityHours,
    studio_remaining_hours: capacityPlan.remaining_hours,
  };
}
