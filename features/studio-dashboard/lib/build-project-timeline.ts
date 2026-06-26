import type { PhaseKind, PhaseStatus } from "@/features/phases/types/phase";
import { PHASE_KIND_LABELS } from "@/features/phases/types/phase";
import type { ProjectWorkspace } from "@/features/projects/types/project-workspace";
import type {
  StudioTimelineStep,
  StudioTimelineStepState,
} from "@/features/studio-dashboard/types/studio-dashboard-view";
import type { ProjectWorkspaceItem } from "@/features/studio-workflow/types/workspace-item";
import { PROJECT_WORK_KIND_LABELS } from "@/features/studio-workflow/types/project-work-kind";

const ROOM_TIMELINE_PHASES: PhaseKind[] = [
  "concept",
  "design_development",
  "documentation",
  "procurement",
  "installation",
  "styling",
];

function mapProjectItemState(
  item: ProjectWorkspaceItem,
  today: string
): StudioTimelineStepState {
  if (item.status === "completed") {
    return "completed";
  }

  if (item.status === "blocked") {
    return "waiting";
  }

  if (
    item.target_end_date &&
    item.target_end_date < today
  ) {
    return "overdue";
  }

  if (item.status === "in_progress") {
    return "current";
  }

  return "future";
}

function aggregateRoomPhaseState(
  statuses: PhaseStatus[],
  isCurrentFlags: boolean[],
  targetDates: Array<string | null>,
  today: string
): StudioTimelineStepState {
  if (statuses.length === 0) {
    return "future";
  }

  if (statuses.every((status) => status === "completed")) {
    return "completed";
  }

  if (statuses.some((status) => status === "blocked")) {
    return "waiting";
  }

  if (
    statuses.some(
      (status, index) =>
        status !== "completed" &&
        targetDates[index] !== null &&
        targetDates[index]! < today
    )
  ) {
    return "overdue";
  }

  if (
    statuses.some((status) => status === "in_progress") ||
    isCurrentFlags.some(Boolean)
  ) {
    return "current";
  }

  if (statuses.every((status) => status === "not_started")) {
    return "future";
  }

  if (statuses.some((status) => status === "completed")) {
    return "current";
  }

  return "future";
}

export function buildProjectTimeline(input: {
  workspace: ProjectWorkspace | null;
  projectItem: ProjectWorkspaceItem | null;
  today: string;
}): StudioTimelineStep[] {
  const steps: StudioTimelineStep[] = [];

  if (input.projectItem) {
    steps.push({
      id: `project-${input.projectItem.kind}`,
      label: PROJECT_WORK_KIND_LABELS[input.projectItem.kind],
      state: mapProjectItemState(input.projectItem, input.today),
    });
  }

  if (!input.workspace) {
    return steps;
  }

  for (const phaseKind of ROOM_TIMELINE_PHASES) {
    const roomPhaseData = input.workspace.rooms.flatMap((room) => {
      const phase = room.phases.find(
        (entry) => entry.label === PHASE_KIND_LABELS[phaseKind]
      );

      if (!phase) {
        return [];
      }

      return [
        {
          status: phase.status,
          is_current: phase.is_current,
          target_end_date: phase.target_end_date,
        },
      ];
    });

    if (roomPhaseData.length === 0) {
      continue;
    }

    steps.push({
      id: `phase-${phaseKind}`,
      label: PHASE_KIND_LABELS[phaseKind],
      state: aggregateRoomPhaseState(
        roomPhaseData.map((entry) => entry.status),
        roomPhaseData.map((entry) => entry.is_current),
        roomPhaseData.map((entry) => entry.target_end_date),
        input.today
      ),
    });
  }

  return steps;
}

function findActiveProjectWorkItem(
  items: ProjectWorkspaceItem[]
): ProjectWorkspaceItem | null {
  const inProgress = items.find((item) => item.status === "in_progress");

  if (inProgress) {
    return inProgress;
  }

  const nextStep = items.find(
    (item) => item.status !== "completed" && item.status !== "blocked"
  );

  return nextStep ?? items.at(-1) ?? null;
}

export { findActiveProjectWorkItem };
