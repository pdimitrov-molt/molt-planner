import { format, parseISO } from "date-fns";

import { assessScheduleFit } from "@/features/intake/lib/assess-schedule-fit";
import { buildSimulatedPhasesForRoomCount } from "@/features/intake/lib/build-simulated-phases";
import { resolveIntakeRoomCount } from "@/features/intake/lib/resolve-intake-room-count";
import type {
  IntakeSimulationInput,
  IntakeSimulationResult,
  IntakeStudioContext,
} from "@/features/intake/types/intake-plan";
import { CapacityCalculator } from "@/features/planner/capacity-calculator";
import {
  getProjectClassificationLabel,
  resolveProjectClassification,
  type ProjectCategory,
} from "@/features/projects/types/project";
import { getRoomTemplateSet } from "@/features/rooms/data/room-templates";
import { bg } from "@/src/i18n/bg";
import { formatArea, formatLongDate } from "@/src/i18n/format";

export function calculateIntakePlan(
  input: IntakeSimulationInput,
  studio: IntakeStudioContext,
  referenceDate: Date = new Date()
): IntakeSimulationResult {
  const classification = resolveProjectClassification(input);
  const roomCount = resolveIntakeRoomCount(classification.category, input.scope);
  const calculator = new CapacityCalculator(studio.weekly_capacity_hours);
  const simulatedPhases = buildSimulatedPhasesForRoomCount(roomCount);
  const estimatedHours = calculator.calculateRemainingHours(simulatedPhases);
  const earliestAvailableStart =
    studio.remaining_hours > 0
      ? studio.earliest_next_project_start
      : format(referenceDate, "yyyy-MM-dd");
  const projectTimeline = calculator.calculate({
    phases: simulatedPhases,
    reference_date: parseISO(earliestAvailableStart),
    weekly_capacity_hours: studio.weekly_capacity_hours,
  });
  const scheduleFit = assessScheduleFit({
    currentRemainingHours: studio.remaining_hours,
    newProjectHours: estimatedHours,
    weeklyCapacityHours: studio.weekly_capacity_hours,
  });

  return {
    ...classification,
    classification_label: getProjectClassificationLabel(classification),
    scope_summary: buildScopeSummary(classification.category, input.scope, roomCount),
    estimate: {
      room_count: roomCount,
      estimated_hours: estimatedHours,
      estimated_duration_weeks: projectTimeline.weeks_to_complete,
      earliest_available_start: earliestAvailableStart,
      earliest_available_start_label: formatIntakeDateLabel(
        earliestAvailableStart,
        studio.remaining_hours > 0
      ),
      estimated_completion_date: projectTimeline.estimated_completion_date,
      estimated_completion_label: formatLongDate(
        projectTimeline.estimated_completion_date
      ),
    },
    schedule_fit: scheduleFit,
  };
}

function buildScopeSummary(
  category: ProjectCategory,
  scope: IntakeSimulationInput["scope"],
  roomCount: number
) {
  if (scope.mode === "manual") {
    const areaLabel =
      scope.site_area !== null && scope.site_area > 0
        ? formatArea(scope.site_area)
        : bg.common.areaNotSpecified;

    return bg.intake.scopeSummary.roomsAndArea(roomCount, areaLabel);
  }

  const templateSet = getRoomTemplateSet(category);
  const templateName = templateSet?.name ?? bg.common.roomTemplateFallback;

  return `${templateName} · ${roomCount} ${roomCount === 1 ? "избрано помещение" : "избрани помещения"}`;
}

function formatIntakeDateLabel(dateValue: string, hasExistingWorkload: boolean) {
  if (!hasExistingWorkload) {
    return bg.common.availableImmediately;
  }

  return formatLongDate(dateValue);
}
