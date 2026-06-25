import { format } from "date-fns";

import { getPhaseTemplateEstimatedHours } from "@/features/phases/data/phase-templates";
import type { PhaseKind, PhaseStatus } from "@/features/phases/types/phase";
import {
  WEEKLY_CAPACITY_HOURS,
  WORKING_DAYS_PER_WEEK,
} from "@/features/planner/capacity";

export interface PhaseWorkloadInput {
  phase_kind: PhaseKind;
  status: PhaseStatus;
  estimated_hours?: number | null;
}

export interface CapacityCalculationInput {
  phases: PhaseWorkloadInput[];
  weekly_capacity_hours?: number;
  reference_date?: Date;
}

export interface CapacityCalculationResult {
  remaining_hours: number;
  completed_hours: number;
  weekly_capacity_hours: number;
  estimated_completion_date: string;
  earliest_next_project_start: string;
  weeks_to_complete: number;
  working_days_to_complete: number;
}

function resolvePhaseHours(phase: PhaseWorkloadInput): number {
  if (phase.estimated_hours !== null && phase.estimated_hours !== undefined) {
    return Number(phase.estimated_hours);
  }

  return getPhaseTemplateEstimatedHours(phase.phase_kind);
}

function isRemainingPhase(status: PhaseStatus) {
  return status !== "completed";
}

function addWorkingDays(startDate: Date, workingDays: number) {
  const result = new Date(startDate);
  let daysAdded = 0;

  while (daysAdded < workingDays) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();

    if (day !== 0 && day !== 6) {
      daysAdded += 1;
    }
  }

  return result;
}

export class CapacityCalculator {
  private readonly weeklyCapacityHours: number;

  constructor(weeklyCapacityHours: number = WEEKLY_CAPACITY_HOURS) {
    this.weeklyCapacityHours = weeklyCapacityHours;
  }

  getDefaultEstimatedHours(phaseKind: PhaseKind): number {
    return getPhaseTemplateEstimatedHours(phaseKind);
  }

  calculateRemainingHours(phases: PhaseWorkloadInput[]): number {
    return phases
      .filter((phase) => isRemainingPhase(phase.status))
      .reduce((total, phase) => total + resolvePhaseHours(phase), 0);
  }

  calculateCompletedHours(phases: PhaseWorkloadInput[]): number {
    return phases
      .filter((phase) => phase.status === "completed")
      .reduce((total, phase) => total + resolvePhaseHours(phase), 0);
  }

  calculateWorkingDaysToComplete(remainingHours: number): number {
    if (remainingHours <= 0) {
      return 0;
    }

    const dailyCapacity = this.weeklyCapacityHours / WORKING_DAYS_PER_WEEK;
    return Math.ceil(remainingHours / dailyCapacity);
  }

  calculateWeeksToComplete(remainingHours: number): number {
    if (remainingHours <= 0) {
      return 0;
    }

    return Math.ceil(remainingHours / this.weeklyCapacityHours);
  }

  calculateCompletionDate(remainingHours: number, referenceDate: Date): Date {
    if (remainingHours <= 0) {
      return new Date(referenceDate);
    }

    const workingDays = this.calculateWorkingDaysToComplete(remainingHours);
    return addWorkingDays(referenceDate, workingDays);
  }

  calculate(input: CapacityCalculationInput): CapacityCalculationResult {
    const referenceDate = input.reference_date ?? new Date();
    const weeklyCapacity =
      input.weekly_capacity_hours ?? this.weeklyCapacityHours;
    const calculator = new CapacityCalculator(weeklyCapacity);
    const remainingHours = calculator.calculateRemainingHours(input.phases);
    const completedHours = calculator.calculateCompletedHours(input.phases);
    const workingDaysToComplete =
      calculator.calculateWorkingDaysToComplete(remainingHours);
    const weeksToComplete = calculator.calculateWeeksToComplete(remainingHours);
    const completionDate = calculator.calculateCompletionDate(
      remainingHours,
      referenceDate
    );

    return {
      remaining_hours: remainingHours,
      completed_hours: completedHours,
      weekly_capacity_hours: weeklyCapacity,
      estimated_completion_date: format(completionDate, "yyyy-MM-dd"),
      earliest_next_project_start: format(completionDate, "yyyy-MM-dd"),
      weeks_to_complete: weeksToComplete,
      working_days_to_complete: workingDaysToComplete,
    };
  }
}

export const capacityCalculator = new CapacityCalculator();
