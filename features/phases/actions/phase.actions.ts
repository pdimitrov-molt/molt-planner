"use server";

import { revalidatePath } from "next/cache";

import { getPhaseService } from "@/features/phases/service/get-phase-service";
import type { CompletePhaseInput } from "@/features/phases/validation/phase.schema";
import { bg } from "@/src/i18n/bg";

export type PhaseActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function completePhaseAction(
  input: CompletePhaseInput
): Promise<PhaseActionResult> {
  try {
    const service = await getPhaseService();
    await service.completePhase(input);

    revalidatePath("/");
    revalidatePath(`/projects/${input.project_id}`);
    revalidatePath(`/projects/${input.project_id}/rooms/${input.room_id}`);

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : bg.errors.completePhase,
    };
  }
}
