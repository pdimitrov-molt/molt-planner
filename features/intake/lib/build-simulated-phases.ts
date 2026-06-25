import { getPhaseTemplateEstimatedHours } from "@/features/phases/data/phase-templates";
import {
  DEFAULT_PHASE_SEQUENCE,
  type PhaseKind,
} from "@/features/phases/types/phase";
import type { PhaseWorkloadInput } from "@/features/planner/capacity-calculator";

export function getEstimatedHoursPerRoom(): number {
  return DEFAULT_PHASE_SEQUENCE.reduce(
    (total, phaseKind) => total + getPhaseTemplateEstimatedHours(phaseKind),
    0
  );
}

export function buildSimulatedPhasesForRoomCount(
  roomCount: number
): PhaseWorkloadInput[] {
  const normalizedRoomCount = Math.max(1, Math.round(roomCount));
  const phases: PhaseWorkloadInput[] = [];

  for (let roomIndex = 0; roomIndex < normalizedRoomCount; roomIndex += 1) {
    for (const phaseKind of DEFAULT_PHASE_SEQUENCE) {
      phases.push(createSimulatedPhase(phaseKind));
    }
  }

  return phases;
}

function createSimulatedPhase(phaseKind: PhaseKind): PhaseWorkloadInput {
  return {
    phase_kind: phaseKind,
    status: "not_started",
    estimated_hours: getPhaseTemplateEstimatedHours(phaseKind),
  };
}
