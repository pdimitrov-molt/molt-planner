import { differenceInCalendarDays, format, parseISO } from "date-fns";

import type { PhaseStatus } from "@/features/phases/types/phase";
import { CapacityCalculator } from "@/features/planner/capacity-calculator";
import type { StagePlanningMetrics } from "@/features/planning-engine/types/planning-engine";

const capacityCalculator = new CapacityCalculator();

function phaseStatusToRemainingFraction(status: PhaseStatus): number {
  switch (status) {
    case "completed":
      return 0;
    case "in_progress":
      return 0.5;
    case "blocked":
      return 1;
    default:
      return 1;
  }
}

export function calculateRemainingHours(input: {
  estimated_hours: number;
  progress_percent?: number;
  status?: PhaseStatus;
}): number {
  if (input.progress_percent !== undefined) {
    const remaining = input.estimated_hours * (1 - input.progress_percent / 100);
    return Math.max(0, Math.round(remaining * 10) / 10);
  }

  if (input.status) {
    const fraction = phaseStatusToRemainingFraction(input.status);
    return Math.max(0, Math.round(input.estimated_hours * fraction * 10) / 10);
  }

  return input.estimated_hours;
}

export function calculateSlackDays(input: {
  estimated_finish_date: string;
  deadline: string | null;
}): number | null {
  if (!input.deadline) {
    return null;
  }

  return differenceInCalendarDays(
    parseISO(input.deadline),
    parseISO(input.estimated_finish_date)
  );
}

export function calculateStageMetrics(input: {
  estimated_hours: number;
  progress_percent?: number;
  status?: PhaseStatus;
  deadline: string | null;
  reference_date: Date;
}): StagePlanningMetrics {
  const remaining_hours = calculateRemainingHours({
    estimated_hours: input.estimated_hours,
    progress_percent: input.progress_percent,
    status: input.status,
  });

  const completionDate = capacityCalculator.calculateCompletionDate(
    remaining_hours,
    input.reference_date
  );

  const estimated_finish_date = format(completionDate, "yyyy-MM-dd");
  const slack_days = calculateSlackDays({
    estimated_finish_date,
    deadline: input.deadline,
  });

  return {
    remaining_hours,
    estimated_finish_date,
    slack_days,
  };
}
