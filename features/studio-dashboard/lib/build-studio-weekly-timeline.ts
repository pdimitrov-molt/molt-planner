import { addDays, differenceInCalendarDays, format, isWeekend, parseISO } from "date-fns";

import type { CommandCenterCapacity } from "@/features/studio-dashboard/types/command-center-view";
import type {
  StudioTimelineBlock,
  StudioTimelineDay,
  StudioTimelineMilestone,
  StudioTimelineMilestoneCategory,
  StudioWeeklyTimelineView,
} from "@/features/studio-dashboard/types/studio-weekly-timeline-view";
import type { ProjectWithClient } from "@/features/projects/types/project";
import { WEEKLY_CAPACITY_HOURS } from "@/features/planner/capacity";
import type { ProjectWorkflowEngineView, WorkflowStageView } from "@/features/workflow-engine/types/workflow-engine";
import { getWaitingReasonLabel } from "@/features/workflow-engine/lib/waiting-reason-labels";
import type { WorkflowWaitingEvent } from "@/features/workflow-engine/types/workflow-waiting-event";
import { bgLocale } from "@/src/i18n/format";

const TIMELINE_DAYS = 14;

interface BuildStudioWeeklyTimelineInput {
  projects: ProjectWithClient[];
  workflows: Map<string, ProjectWorkflowEngineView>;
  waitingEvents: WorkflowWaitingEvent[];
  capacity: CommandCenterCapacity;
  referenceDate?: Date;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function buildDays(referenceDate: Date): StudioTimelineDay[] {
  const today = startOfDay(referenceDate);

  return Array.from({ length: TIMELINE_DAYS }, (_, index) => {
    const date = addDays(today, index);

    return {
      index,
      date_iso: format(date, "yyyy-MM-dd"),
      label: format(date, "EEE d", { locale: bgLocale }),
      is_today: index === 0,
      is_weekend: isWeekend(date),
    };
  });
}

function dayIndexForDate(referenceDate: Date, value: string | null): number | null {
  if (!value) {
    return null;
  }

  const dayOffset = differenceInCalendarDays(startOfDay(parseISO(value)), startOfDay(referenceDate));

  if (dayOffset < 0 || dayOffset >= TIMELINE_DAYS) {
    return null;
  }

  return dayOffset;
}

function buildProjectHref(projectId: string): string {
  return `/projects/${projectId}`;
}

function flattenStages(workflow: ProjectWorkflowEngineView): WorkflowStageView[] {
  return workflow.groups
    .filter((group) => group.enabled)
    .flatMap((group) => group.stages.filter((stage) => stage.enabled));
}

function resolveStageState(stage: WorkflowStageView): StudioTimelineBlock["state"] {
  if (stage.status === "completed" || stage.progress_percent >= 100) {
    return "completed";
  }

  if (stage.is_current || stage.status === "in_progress") {
    return "current";
  }

  return "future";
}

function buildStageBlocks(input: {
  workflow: ProjectWorkflowEngineView;
  projectId: string;
  referenceDate: Date;
}): StudioTimelineBlock[] {
  const blocks: StudioTimelineBlock[] = [];
  const stages = flattenStages(input.workflow);
  let cursor = 0;

  for (const stage of stages) {
    const state = resolveStageState(stage);
    const completedDayIndex = stage.instances
      .map((instance) => dayIndexForDate(input.referenceDate, instance.completed_at))
      .find((value) => value !== null);

    if (state === "completed") {
      if (completedDayIndex !== null && completedDayIndex !== undefined) {
        blocks.push({
          id: `${input.projectId}-${stage.id}-completed`,
          label: stage.name,
          start_day_index: completedDayIndex,
          span_days: 1,
          state: "completed",
          href: buildProjectHref(input.projectId),
        });
      }

      continue;
    }

    if (state === "current") {
      const start = Math.min(Math.max(cursor, 0), TIMELINE_DAYS - 1);
      const span = Math.min(3, TIMELINE_DAYS - start);

      blocks.push({
        id: `${input.projectId}-${stage.id}-current`,
        label: stage.name,
        start_day_index: start,
        span_days: span,
        state: "current",
        href: buildProjectHref(input.projectId),
      });

      cursor = start + span;
      continue;
    }

    if (cursor >= TIMELINE_DAYS) {
      continue;
    }

    blocks.push({
      id: `${input.projectId}-${stage.id}-future`,
      label: stage.name,
      start_day_index: cursor,
      span_days: 1,
      state: "future",
      href: buildProjectHref(input.projectId),
    });

    cursor += 1;
  }

  return blocks;
}

function buildWaitingBlocks(input: {
  projectId: string;
  waitingEvents: WorkflowWaitingEvent[];
  referenceDate: Date;
}): StudioTimelineBlock[] {
  return input.waitingEvents
    .filter((event) => event.project_id === input.projectId)
    .map((event) => {
      const start = dayIndexForDate(input.referenceDate, event.started_at) ?? 0;
      const end =
        dayIndexForDate(input.referenceDate, event.expected_end_at) ??
        Math.min(start + 2, TIMELINE_DAYS - 1);
      const span = Math.max(1, end - start + 1);

      return {
        id: event.id,
        label: getWaitingReasonLabel(event.reason, event.custom_reason),
        start_day_index: start,
        span_days: Math.min(span, TIMELINE_DAYS - start),
        state: "waiting" as const,
        href: buildProjectHref(input.projectId),
      };
    });
}

function categorizeMilestone(stage: WorkflowStageView): StudioTimelineMilestoneCategory | null {
  const key = stage.key.toLowerCase();

  if (key.includes("presentation")) {
    return "presentation";
  }

  if (key.includes("approval")) {
    return "approval";
  }

  if (key.includes("delivery")) {
    return "delivery";
  }

  if (key.includes("installation") || stage.legacy_phase_kind === "installation") {
    return "installation";
  }

  return null;
}

function buildMilestones(input: {
  projects: ProjectWithClient[];
  workflows: Map<string, ProjectWorkflowEngineView>;
}): StudioTimelineMilestone[] {
  const milestones: StudioTimelineMilestone[] = [];

  for (const project of input.projects) {
    const workflow = input.workflows.get(project.id);

    if (!workflow) {
      continue;
    }

    for (const group of workflow.groups) {
      if (!group.enabled) {
        continue;
      }

      for (const stage of group.stages) {
        if (!stage.enabled || stage.status === "completed") {
          continue;
        }

        const category = categorizeMilestone(stage);

        if (!category) {
          continue;
        }

        milestones.push({
          id: `${project.id}-${stage.id}`,
          category,
          project_id: project.id,
          project_name: project.name,
          stage_name: stage.name,
          group_name: group.name,
          href: buildProjectHref(project.id),
        });
      }
    }
  }

  return milestones;
}

function buildCapacityForecast(capacity: CommandCenterCapacity) {
  const followingWeekHours = Math.min(
    Math.max(0, capacity.total_remaining_hours - capacity.this_week_hours - capacity.next_week_hours),
    WEEKLY_CAPACITY_HOURS
  );

  return {
    this_week_hours: capacity.this_week_hours,
    next_week_hours: capacity.next_week_hours,
    following_week_hours: Math.round(followingWeekHours * 10) / 10,
  };
}

function isActiveProject(project: ProjectWithClient): boolean {
  return project.engagement_status === "active" || project.engagement_status === "inquiry";
}

export function buildStudioWeeklyTimeline(
  input: BuildStudioWeeklyTimelineInput
): StudioWeeklyTimelineView {
  const referenceDate = startOfDay(input.referenceDate ?? new Date());
  const days = buildDays(referenceDate);
  const activeProjects = input.projects.filter(isActiveProject);

  const project_rows = activeProjects
    .map((project) => {
      const workflow = input.workflows.get(project.id);

      if (!workflow) {
        return null;
      }

      const stageBlocks = buildStageBlocks({
        workflow,
        projectId: project.id,
        referenceDate,
      });
      const waitingBlocks = buildWaitingBlocks({
        projectId: project.id,
        waitingEvents: input.waitingEvents,
        referenceDate,
      });

      return {
        project_id: project.id,
        project_name: project.name,
        href: buildProjectHref(project.id),
        deadline_day_index: dayIndexForDate(referenceDate, project.design_deadline),
        blocks: [...stageBlocks, ...waitingBlocks],
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((left, right) => left.project_name.localeCompare(right.project_name, "bg"));

  return {
    days,
    project_rows,
    capacity_forecast: buildCapacityForecast(input.capacity),
    milestones: buildMilestones({
      projects: activeProjects,
      workflows: input.workflows,
    }),
  };
}
