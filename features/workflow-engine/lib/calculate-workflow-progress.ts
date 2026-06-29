import type { PhaseStatus } from "@/features/phases/types/phase";
import type { TaskStatus } from "@/features/tasks/types/task";
import type {
  LegacyPhaseSnapshot,
  LegacyTaskSnapshot,
  WorkflowItemStatus,
} from "@/features/workflow-engine/types/workflow-engine";

function phaseStatusToProgress(status: PhaseStatus): number {
  switch (status) {
    case "completed":
      return 100;
    case "in_progress":
      return 50;
    case "blocked":
      return 25;
    default:
      return 0;
  }
}

function taskStatusToProgress(status: TaskStatus): number {
  return status === "done" ? 100 : status === "in_progress" ? 50 : 0;
}

export function calculateTaskProgress(
  tasks: LegacyTaskSnapshot[],
  phaseIds: string[]
): number | null {
  const relevant = tasks.filter((task) => phaseIds.includes(task.phase_id));

  if (relevant.length === 0) {
    return null;
  }

  const total = relevant.reduce(
    (sum, task) => sum + taskStatusToProgress(task.status),
    0
  );

  return Math.round(total / relevant.length);
}

export function calculatePhaseProgress(
  phases: LegacyPhaseSnapshot[],
  phaseIds: string[]
): number {
  const relevant = phases.filter((phase) => phaseIds.includes(phase.id));

  if (relevant.length === 0) {
    return 0;
  }

  const total = relevant.reduce(
    (sum, phase) => sum + phaseStatusToProgress(phase.status),
    0
  );

  return Math.round(total / relevant.length);
}

export function aggregateStatus(progress: number, hasBlocked: boolean): WorkflowItemStatus {
  if (hasBlocked) {
    return "blocked";
  }

  if (progress >= 100) {
    return "completed";
  }

  if (progress > 0) {
    return "in_progress";
  }

  return "not_started";
}

export function averageProgress(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(
    values.reduce((total, value) => total + value, 0) / values.length
  );
}
