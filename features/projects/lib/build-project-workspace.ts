import {
  PHASE_KIND_LABELS,
  type PhaseKind,
} from "@/features/phases/types/phase";
import { getPhaseTemplateEstimatedHours } from "@/features/phases/data/phase-templates";
import {
  calculateLoad,
  WEEKLY_CAPACITY_HOURS,
} from "@/features/planner/capacity";
import { CapacityCalculator } from "@/features/planner/capacity-calculator";
import {
  getProjectTypeLabel,
  PROJECT_PRIORITY_LABELS,
} from "@/features/projects/types/project";
import type {
  ProjectWorkspace,
  WaitingCategory,
  WorkspaceSourceProject,
  WorkspaceSourceRoom,
  WorkspaceSourceTask,
  WorkspaceWaitingItem,
} from "@/features/projects/types/project-workspace";
import {
  ROOM_KIND_LABELS,
  ROOM_PRIORITY_LABELS,
  type RoomKind,
  type RoomPriority,
} from "@/features/rooms/types/room";
import {
  TASK_KIND_LABELS,
} from "@/features/tasks/types/task";
import { bg } from "@/src/i18n/bg";
import { formatArea as formatAreaDisplay, formatLongDate } from "@/src/i18n/format";

const DAILY_CAPACITY_HOURS = WEEKLY_CAPACITY_HOURS / 5;

const CLIENT_APPROVAL_PHASES: PhaseKind[] = ["concept", "design_development"];
const SUPPLIER_PHASES: PhaseKind[] = ["procurement"];

const WAITING_CATEGORY_LABELS: Record<WaitingCategory, string> =
  bg.labels.waitingCategory;

function formatArea(area: number | null) {
  if (area === null) {
    return bg.common.areaNotSet;
  }

  return formatAreaDisplay(area);
}

function formatHandoverDate(value: string | null) {
  if (!value) {
    return bg.common.handoverNotScheduled;
  }

  return formatLongDate(value);
}

function calculateRoomRemainingHours(room: WorkspaceSourceRoom) {
  return room.phases
    .filter((phase) => phase.status !== "completed")
    .reduce(
      (total, phase) =>
        total +
        Number(
          phase.estimated_hours ?? getPhaseTemplateEstimatedHours(phase.phase_kind)
        ),
      0
    );
}

function mapRoomPhases(room: WorkspaceSourceRoom) {
  return room.phases.map((phase) => ({
    id: phase.id,
    label: PHASE_KIND_LABELS[phase.phase_kind],
    status: phase.status,
    is_current: phase.id === room.current_phase_id,
  }));
}

function getCurrentPhase(room: WorkspaceSourceRoom) {
  return room.phases.find((phase) => phase.id === room.current_phase_id) ?? room.phases[0];
}

function calculateRoomProgress(room: WorkspaceSourceRoom) {
  if (room.phases.length === 0) {
    return 0;
  }

  const completedCount = room.phases.filter(
    (phase) => phase.status === "completed"
  ).length;

  return Math.round((completedCount / room.phases.length) * 100);
}

function calculateOverallProgress(rooms: WorkspaceSourceRoom[]) {
  const allPhases = rooms.flatMap((room) => room.phases);

  if (allPhases.length === 0) {
    return 0;
  }

  const completedCount = allPhases.filter(
    (phase) => phase.status === "completed"
  ).length;

  return Math.round((completedCount / allPhases.length) * 100);
}

function resolveFocusRoom(rooms: WorkspaceSourceRoom[]) {
  const scoredRooms = rooms.map((room) => {
    const currentPhase = getCurrentPhase(room);
    let score = 0;

    if (currentPhase?.status === "blocked") {
      score += 100;
    }

    if (currentPhase?.status === "in_progress") {
      score += 50;
    }

    if (room.priority === "high") {
      score += 20;
    }

    if (room.priority === "normal") {
      score += 10;
    }

    return { room, score, progress: calculateRoomProgress(room) };
  });

  scoredRooms.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return left.progress - right.progress;
  });

  return scoredRooms[0]?.room ?? null;
}

function resolveCriticalPhase(rooms: WorkspaceSourceRoom[], focusRoom: WorkspaceSourceRoom | null) {
  const blockedPhases = rooms.flatMap((room) =>
    room.phases
      .filter((phase) => phase.status === "blocked")
      .map((phase) => ({ room, phase }))
  );

  if (blockedPhases.length > 0) {
    const mostUrgent = blockedPhases.sort((left, right) => {
      const leftDate = left.phase.target_end_date ?? "9999-12-31";
      const rightDate = right.phase.target_end_date ?? "9999-12-31";
      return leftDate.localeCompare(rightDate);
    })[0];

    return {
      label: bg.workspaceMessages.criticalPhase.blocked(
        PHASE_KIND_LABELS[mostUrgent.phase.phase_kind]
      ),
      context: bg.workspaceMessages.criticalPhase.blockedContext(
        mostUrgent.room.name
      ),
    };
  }

  if (focusRoom) {
    const currentPhase = getCurrentPhase(focusRoom);

    if (currentPhase) {
      return {
        label: bg.workspaceMessages.criticalPhase.inProgress(
          PHASE_KIND_LABELS[currentPhase.phase_kind]
        ),
        context: bg.workspaceMessages.criticalPhase.inProgressContext(
          focusRoom.name
        ),
      };
    }
  }

  return {
    label: bg.workspaceMessages.criticalPhase.rampingUp,
    context: bg.workspaceMessages.criticalPhase.noBlockers,
  };
}

function buildWaitingItems(
  rooms: WorkspaceSourceRoom[],
  tasks: WorkspaceSourceTask[]
): WorkspaceWaitingItem[] {
  const items: WorkspaceWaitingItem[] = [];

  for (const room of rooms) {
    for (const phase of room.phases) {
      if (phase.status !== "blocked") {
        continue;
      }

      let category: WaitingCategory = "blocked_phase";

      if (CLIENT_APPROVAL_PHASES.includes(phase.phase_kind)) {
        category = "client_approval";
      } else if (SUPPLIER_PHASES.includes(phase.phase_kind)) {
        category = "supplier_waiting";
      }

      items.push({
        id: `phase-${phase.id}`,
        category,
        title: bg.workspaceMessages.waiting.phaseBlocked(
          PHASE_KIND_LABELS[phase.phase_kind]
        ),
        context:
          phase.blocker_reason ??
          bg.workspaceMessages.waiting.categoryHolding(
            WAITING_CATEGORY_LABELS[category],
            room.name
          ),
        room_name: room.name,
      });
    }
  }

  for (const task of tasks) {
    if (task.status !== "blocked") {
      continue;
    }

    const room = rooms.find((entry) => entry.id === task.room_id);
    const phase = room?.phases.find((entry) => entry.id === task.phase_id);
    let category: WaitingCategory = "blocked_phase";

    if (task.task_kind === "client_presentation") {
      category = "client_approval";
    } else if (task.task_kind === "sourcing") {
      category = "supplier_waiting";
    }

    items.push({
      id: `task-${task.id}`,
      category,
      title: task.title,
      context:
        task.blocked_reason ??
        bg.workspaceMessages.waiting.taskWaiting(
          TASK_KIND_LABELS[task.task_kind],
          room?.name ?? bg.common.projectFallback
        ),
      room_name: room?.name ?? bg.common.projectFallback,
    });
  }

  return items.slice(0, 8);
}

function buildCapacityImpact(todayHours: number) {
  const loadPercent = calculateLoad(todayHours, DAILY_CAPACITY_HOURS);

  if (todayHours === 0) {
    return {
      loadPercent: 0,
      label: bg.workspaceMessages.capacityImpact.none,
    };
  }

  if (loadPercent >= 100) {
    return {
      loadPercent,
      label: bg.workspaceMessages.capacityImpact.fillsDay,
    };
  }

  if (loadPercent >= 60) {
    return {
      loadPercent,
      label: bg.workspaceMessages.capacityImpact.heavy,
    };
  }

  return {
    loadPercent,
    label: bg.workspaceMessages.capacityImpact.moderate,
  };
}

export function buildProjectWorkspace(
  source: WorkspaceSourceProject,
  todayIsoDate: string
): ProjectWorkspace {
  const focusRoom = resolveFocusRoom(source.rooms);
  const criticalPhase = resolveCriticalPhase(source.rooms, focusRoom);
  const todayTasks = source.tasks
    .filter((task) => task.scheduled_date === todayIsoDate)
    .map((task) => {
      const room = source.rooms.find((entry) => entry.id === task.room_id);
      const phase = room?.phases.find((entry) => entry.id === task.phase_id);

      return {
        id: task.id,
        title: task.title,
        room_name: room?.name ?? bg.common.projectFallback,
        phase_label: phase
          ? PHASE_KIND_LABELS[phase.phase_kind]
          : bg.common.workflow,
        estimated_hours: task.estimated_hours,
        status: task.status,
        status_label:
          task.status === "in_progress"
            ? bg.workspaceMessages.todayStatus.inProgress
            : task.status === "scheduled"
              ? bg.workspaceMessages.todayStatus.scheduled
              : bg.workspaceMessages.todayStatus.planned,
      };
    });

  const todayHours = todayTasks.reduce(
    (total, task) => total + task.estimated_hours,
    0
  );
  const capacityImpact = buildCapacityImpact(todayHours);
  const projectPhases = source.rooms.flatMap((room) => room.phases);
  const projectCapacity = new CapacityCalculator(WEEKLY_CAPACITY_HOURS).calculate({
    phases: projectPhases.map((phase) => ({
      phase_kind: phase.phase_kind,
      status: phase.status,
      estimated_hours: phase.estimated_hours,
    })),
  });

  return {
    id: source.id,
    name: source.name,
    client_display_name: source.client_display_name,
    project_type_label: getProjectTypeLabel(source.project_type),
    site_area_label: formatArea(source.site_area),
    engagement_status: source.engagement_status,
    priority: source.priority,
    target_handover_label: formatHandoverDate(source.target_handover_date),
    overall_completion_percent: calculateOverallProgress(source.rooms),
    critical_phase_label: criticalPhase.label,
    critical_phase_context: criticalPhase.context,
    capacity_hours_today: todayHours,
    capacity_load_percent: capacityImpact.loadPercent,
    capacity_impact_label: capacityImpact.label,
    remaining_phase_hours: projectCapacity.remaining_hours,
    estimated_project_completion_label:
      projectCapacity.remaining_hours > 0
        ? formatLongDate(projectCapacity.estimated_completion_date)
        : bg.common.complete,
    focus_room_id: focusRoom?.id ?? null,
    focus_room_name: focusRoom?.name ?? null,
    rooms: source.rooms.map((room) => {
      const currentPhase = getCurrentPhase(room);

      return {
        id: room.id,
        name: room.name,
        room_kind_label:
          ROOM_KIND_LABELS[room.room_kind as RoomKind] ?? room.room_kind,
        current_phase_label: currentPhase
          ? PHASE_KIND_LABELS[currentPhase.phase_kind]
          : bg.common.notStarted,
        current_phase_status: currentPhase?.status ?? "not_started",
        is_focus: focusRoom?.id === room.id,
        priority:
          ROOM_PRIORITY_LABELS[room.priority as RoomPriority] ?? room.priority,
        phases: mapRoomPhases(room),
        remaining_hours: calculateRoomRemainingHours(room),
      };
    }),
    today_tasks: todayTasks,
    waiting_items: buildWaitingItems(source.rooms, source.tasks),
  };
}

export { DAILY_CAPACITY_HOURS, WAITING_CATEGORY_LABELS };
