import { CapacityCalculator } from "@/features/planner/capacity-calculator";
import type { ScheduleFitAssessment } from "@/features/intake/types/intake-plan";
import { bg } from "@/src/i18n/bg";

const BACKLOG_YELLOW_WEEKS = 8;
const BACKLOG_RED_WEEKS = 16;
const PARALLEL_DELAY_YELLOW_WEEKS = 1;
const PARALLEL_DELAY_RED_WEEKS = 2;
const LARGE_PROJECT_WEEKLY_MULTIPLIER = 1.5;

interface AssessScheduleFitInput {
  currentRemainingHours: number;
  newProjectHours: number;
  weeklyCapacityHours: number;
}

export function assessScheduleFit(
  input: AssessScheduleFitInput
): ScheduleFitAssessment {
  const calculator = new CapacityCalculator(input.weeklyCapacityHours);
  const currentRemainingHours = Math.max(0, input.currentRemainingHours);
  const newProjectHours = Math.max(0, input.newProjectHours);
  const combinedRemainingHours = currentRemainingHours + newProjectHours;

  const studioBacklogWeeksBefore =
    calculator.calculateWeeksToComplete(currentRemainingHours);
  const studioBacklogWeeksAfter =
    calculator.calculateWeeksToComplete(combinedRemainingHours);
  const combinedPipelineWeeks = studioBacklogWeeksAfter;
  const parallelDelayWeeks =
    currentRemainingHours > 0
      ? Math.max(0, studioBacklogWeeksAfter - studioBacklogWeeksBefore)
      : 0;

  const isLargeProject =
    newProjectHours > input.weeklyCapacityHours * LARGE_PROJECT_WEEKLY_MULTIPLIER;

  if (
    currentRemainingHours > 0 &&
    parallelDelayWeeks >= PARALLEL_DELAY_RED_WEEKS
  ) {
    return buildAssessment({
      status: "red",
      headline: bg.scheduleFitMessages.red.headline,
      detail: bg.scheduleFitMessages.red.parallelDetail(parallelDelayWeeks),
      currentRemainingHours,
      combinedRemainingHours,
      combinedPipelineWeeks,
      parallelDelayWeeks,
      studioBacklogWeeksBefore,
      studioBacklogWeeksAfter,
    });
  }

  if (studioBacklogWeeksAfter >= BACKLOG_RED_WEEKS) {
    return buildAssessment({
      status: "red",
      headline: bg.scheduleFitMessages.red.headline,
      detail: bg.scheduleFitMessages.red.pipelineDetail(studioBacklogWeeksAfter),
      currentRemainingHours,
      combinedRemainingHours,
      combinedPipelineWeeks,
      parallelDelayWeeks,
      studioBacklogWeeksBefore,
      studioBacklogWeeksAfter,
    });
  }

  if (
    (currentRemainingHours > 0 &&
      parallelDelayWeeks >= PARALLEL_DELAY_YELLOW_WEEKS) ||
    studioBacklogWeeksAfter >= BACKLOG_YELLOW_WEEKS ||
    (currentRemainingHours > 0 && isLargeProject)
  ) {
    return buildAssessment({
      status: "yellow",
      headline: bg.scheduleFitMessages.yellow.headline,
      detail: buildYellowDetail({
        currentRemainingHours,
        parallelDelayWeeks,
        studioBacklogWeeksAfter,
        isLargeProject,
      }),
      currentRemainingHours,
      combinedRemainingHours,
      combinedPipelineWeeks,
      parallelDelayWeeks,
      studioBacklogWeeksBefore,
      studioBacklogWeeksAfter,
    });
  }

  return buildAssessment({
    status: "green",
    headline: bg.scheduleFitMessages.green.headline,
    detail:
      currentRemainingHours > 0
        ? bg.scheduleFitMessages.green.detailWithWorkload
        : bg.scheduleFitMessages.green.detailOpen,
    currentRemainingHours,
    combinedRemainingHours,
    combinedPipelineWeeks,
    parallelDelayWeeks,
    studioBacklogWeeksBefore,
    studioBacklogWeeksAfter,
  });
}

function buildYellowDetail(params: {
  currentRemainingHours: number;
  parallelDelayWeeks: number;
  studioBacklogWeeksAfter: number;
  isLargeProject: boolean;
}) {
  if (params.currentRemainingHours > 0 && params.parallelDelayWeeks > 0) {
    return bg.scheduleFitMessages.yellow.parallelDetail(params.parallelDelayWeeks);
  }

  if (params.isLargeProject) {
    return bg.scheduleFitMessages.yellow.largeProject;
  }

  return bg.scheduleFitMessages.yellow.pipelineDetail(params.studioBacklogWeeksAfter);
}

interface BuildAssessmentInput {
  status: ScheduleFitAssessment["status"];
  headline: string;
  detail: string;
  currentRemainingHours: number;
  combinedRemainingHours: number;
  combinedPipelineWeeks: number;
  parallelDelayWeeks: number;
  studioBacklogWeeksBefore: number;
  studioBacklogWeeksAfter: number;
}

function buildAssessment(params: BuildAssessmentInput): ScheduleFitAssessment {
  return {
    status: params.status,
    headline: params.headline,
    detail: params.detail,
    current_remaining_hours: params.currentRemainingHours,
    combined_remaining_hours: params.combinedRemainingHours,
    combined_pipeline_weeks: params.combinedPipelineWeeks,
    parallel_delay_weeks: params.parallelDelayWeeks,
    studio_backlog_weeks_before: params.studioBacklogWeeksBefore,
    studio_backlog_weeks_after: params.studioBacklogWeeksAfter,
  };
}
