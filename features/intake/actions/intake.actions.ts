"use server";

import { getIntakeService } from "@/features/intake/service/intake.service";
import type {
  IntakeSimulationInput,
  IntakeSimulationResult,
} from "@/features/intake/types/intake-plan";
import { bg } from "@/src/i18n/bg";

export type IntakeActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function simulateIntakeAction(
  input: IntakeSimulationInput
): Promise<IntakeActionResult<IntakeSimulationResult>> {
  try {
    const service = await getIntakeService();
    const studio = await service.getStudioContext();
    const result = service.simulateIntakeWithStudioContext(input, studio);

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : bg.errors.intakeSimulation,
    };
  }
}
