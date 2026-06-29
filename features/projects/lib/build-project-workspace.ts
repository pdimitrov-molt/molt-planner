import {
  calculateProjectProgress,
  calculateRoomProgress,
} from "@/features/progress/lib/calculate-progress";
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
  getProjectClassificationLabel,
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

function formatOptionalDate(value: string | null, emptyLabel: string) {
  if (!value) {
    return emptyLabel;
  }

  return formatLongDate(value);
}

function getNextPhase(room: WorkspaceSourceRoom) {
  const currentIndex = room.phases.findIndex(
    (phase) => phase.id === room.current_phase_id
  );

  if (currentIndex === -1) {
    return room.phases[1] ?? null;
  }

  return room.phases[currentIndex + 1] ?? null;
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
    phase_kind: phase.phase_kind,
    status: phase.status,
    is_current: phase.id === room.current_phase_id,
    estimated_hours:
      phase.estimated_hours ?? getPhaseTemplateEstimatedHours(phase.phase_kind),
    target_end_date: phase.target_end_date,
  }));
}

function getCurrentPhase(room: WorkspaceSourceRoom) {
  return room.phases.find((phase) => phase.id === room.current_phase_id) ?? room.phases[0];
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

    const progress = calculateRoomProgress(room.phases);

    return { room, score, progress: progress.progress_percent };
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
  const projectProgress = calculateProjectProgress(source.rooms);
  const projectCapacity = new CapacityCalculator(WEEKLY_CAPACITY_HOURS).calculate({
    phases: projectPhases.map((phase) => ({
      phase_kind: phase.phase_kind,
      status: phase.status,
      estimated_hours: phase.estimated_hours,
    })),
  });

  return {
    id: source.id,
    project_number: source.project_number,
    name: source.name,
    client_display_name: source.client_display_name,
    classification_label: getProjectClassificationLabel(source),
    site_area_label: formatArea(source.site_area),
    engagement_status: source.engagement_status,
    priority: source.priority,
    design_deadline_label: formatOptionalDate(
      source.design_deadline,
      bg.common.dateNotSet
    ),
    execution_deadline_label: formatOptionalDate(
      source.execution_deadline,
      bg.common.dateNotSet
    ),
    move_in_date_label: formatOptionalDate(
      source.move_in_date,
      bg.common.handoverNotScheduled
    ),
    overall_completion_percent: projectProgress.progress_percent,
    completed_rooms: projectProgress.completed_rooms,
    total_rooms: projectProgress.total_rooms,
    completed_phases: projectProgress.completed_phases,
    total_phases: projectProgress.total_phases,
    is_completed: projectProgress.is_completed,
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
      const nextPhase = getNextPhase(room);
      const roomProgress = calculateRoomProgress(room.phases);

      return {
        id: room.id,
        name: room.name,
        room_kind_label:
          ROOM_KIND_LABELS[room.room_kind as RoomKind] ?? room.room_kind,
        current_phase_label: currentPhase
          ? PHASE_KIND_LABELS[currentPhase.phase_kind]
          : bg.common.notStarted,
        current_phase_status: currentPhase?.status ?? "not_started",
        next_phase_label: nextPhase
          ? PHASE_KIND_LABELS[nextPhase.phase_kind]
          : null,
        progress_percent: roomProgress.progress_percent,
        completed_phases: roomProgress.completed_phases,
        total_phases: roomProgress.total_phases,
        is_completed: roomProgress.is_completed,
        status_label: roomProgress.is_completed
          ? bg.progress.roomCompleted
          : currentPhase
            ? bg.labels.phaseStatus[currentPhase.status]
            : bg.labels.phaseStatus.not_started,
        is_focus: focusRoom?.id === room.id,
        priority:
          ROOM_PRIORITY_LABELS[room.priority as RoomPriority] ?? room.priority,
        remaining_hours: calculateRoomRemainingHours(room),
        phases: mapRoomPhases(room),
      };
    }),
    today_tasks: todayTasks,
    waiting_items: buildWaitingItems(source.rooms, source.tasks),
  };
}

export { DAILY_CAPACITY_HOURS, WAITING_CATEGORY_LABELS };
