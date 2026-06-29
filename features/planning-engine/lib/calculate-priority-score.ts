import { differenceInCalendarDays, parseISO } from "date-fns";

import type { PhaseStatus } from "@/features/phases/types/phase";
import type { ProjectPriority } from "@/features/projects/types/project";

const PROJECT_PRIORITY_WEIGHT: Record<ProjectPriority, number> = {
  low: 0.25,
  normal: 0.5,
  high: 0.75,
  critical: 1,
};

const STATUS_WEIGHT: Record<PhaseStatus, number> = {
  in_progress: 1,
  not_started: 0.55,
  blocked: 0.15,
  completed: 0,
};

export function calculatePriorityScore(input: {
  remaining_minutes: number;
  worked_minutes: number;
  slack_days: number | null;
  design_deadline: string | null;
  project_priority: ProjectPriority;
  status: PhaseStatus;
  is_active_timer: boolean;
  is_waiting?: boolean;
  last_activity_at: string | null;
  reference_date: Date;
}): number {
  if (input.is_waiting) {
    return 0;
  }

  const deadlineUrgency = resolveDeadlineUrgency({
    slack_days: input.slack_days,
    design_deadline: input.design_deadline,
    reference_date: input.reference_date,
  });

  const remainingUrgency = Math.min(1, input.remaining_minutes / (8 * 60));
  const totalMinutes = input.worked_minutes + input.remaining_minutes;
  const inProgressBoost =
    totalMinutes > 0 &&
    input.worked_minutes > 0 &&
    input.remaining_minutes > 0 &&
    input.status === "in_progress"
      ? 0.12
      : 0;
  const lastActivityUrgency = resolveLastActivityUrgency(
    input.last_activity_at,
    input.reference_date
  );
  const priorityWeight = PROJECT_PRIORITY_WEIGHT[input.project_priority];
  const statusWeight = STATUS_WEIGHT[input.status];
  const timerBoost = input.is_active_timer ? 1 : 0;

  const score =
    deadlineUrgency * 40 +
    remainingUrgency * 18 +
    lastActivityUrgency * 12 +
    priorityWeight * 15 +
    statusWeight * 10 +
    timerBoost * 25 +
    inProgressBoost * 10;

  return Math.round(score * 10) / 10;
}

function resolveLastActivityUrgency(
  lastActivityAt: string | null,
  referenceDate: Date
): number {
  if (!lastActivityAt) {
    return 0.75;
  }

  const daysSinceActivity = differenceInCalendarDays(
    referenceDate,
    parseISO(lastActivityAt)
  );

  if (daysSinceActivity <= 1) {
    return 0.25;
  }

  if (daysSinceActivity <= 3) {
    return 0.45;
  }

  if (daysSinceActivity <= 7) {
    return 0.65;
  }

  if (daysSinceActivity <= 14) {
    return 0.8;
  }

  return 1;
}

function resolveDeadlineUrgency(input: {
  slack_days: number | null;
  design_deadline: string | null;
  reference_date: Date;
}): number {
  if (input.design_deadline) {
    const daysUntilDeadline = differenceInCalendarDays(
      parseISO(input.design_deadline),
      input.reference_date
    );

    if (daysUntilDeadline < 0) {
      return 1;
    }

    if (daysUntilDeadline <= 7) {
      return 0.95;
    }

    if (daysUntilDeadline <= 14) {
      return 0.8;
    }

    if (daysUntilDeadline <= 30) {
      return 0.55;
    }
  }

  if (input.slack_days === null) {
    return 0.35;
  }

  if (input.slack_days < 0) {
    return 1;
  }

  if (input.slack_days <= 3) {
    return 0.85;
  }

  if (input.slack_days <= 7) {
    return 0.65;
  }

  if (input.slack_days <= 14) {
    return 0.45;
  }

  return Math.max(0.1, 1 - input.slack_days / 60);
}
