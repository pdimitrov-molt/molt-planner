"use server";

import { revalidatePath } from "next/cache";

import { getWorkSessionService } from "@/features/work-sessions/service/get-work-session-service";
import { WorkSessionService } from "@/features/work-sessions/service/work-session.service";
import type { WorkSession } from "@/features/work-sessions/types/work-session";
import type {
  CompleteWorkSessionInput,
  CompleteStageManuallyInput,
  DeleteWorkSessionInput,
  FindWorkSessionsByPhaseInput,
  LogManualWorkSessionInput,
  PauseWorkSessionInput,
  ResumeWorkSessionInput,
  StartWorkSessionInput,
  UpdateManualWorkSessionInput,
} from "@/features/work-sessions/validation/work-session.schema";
import { completeStageManuallySchema } from "@/features/work-sessions/validation/work-session.schema";
import { getWorkflowStageCompletionService } from "@/features/workflow-engine/service/get-workflow-stage-completion-service";
import { PhaseRepository } from "@/features/phases/repository/phase.repository";
import { getCachedSupabaseServerClient } from "@/lib/server/request-cache";
import { bg } from "@/src/i18n/bg";

export type WorkSessionActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function revalidateWorkSessionPaths(session: WorkSession) {
  revalidatePath("/");
  revalidatePath(`/projects/${session.project_id}`);

  if (session.room_id) {
    revalidatePath(`/projects/${session.project_id}/rooms/${session.room_id}`);
  }
}

export async function startWorkSessionAction(
  input: StartWorkSessionInput
): Promise<WorkSessionActionResult<WorkSession>> {
  try {
    const service = await getWorkSessionService();
    const session = await service.startSession(input);
    revalidateWorkSessionPaths(session);
    return { success: true, data: session };
  } catch (error) {
    if (WorkSessionService.isValidationError(error)) {
      return {
        success: false,
        error: WorkSessionService.getValidationMessage(error),
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to start work session.",
    };
  }
}

export async function pauseWorkSessionAction(
  input: PauseWorkSessionInput
): Promise<WorkSessionActionResult<WorkSession>> {
  try {
    const service = await getWorkSessionService();
    const session = await service.pauseSession(input);
    revalidateWorkSessionPaths(session);
    return { success: true, data: session };
  } catch (error) {
    if (WorkSessionService.isValidationError(error)) {
      return {
        success: false,
        error: WorkSessionService.getValidationMessage(error),
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to pause work session.",
    };
  }
}

export async function resumeWorkSessionAction(
  input: ResumeWorkSessionInput
): Promise<WorkSessionActionResult<WorkSession>> {
  try {
    const service = await getWorkSessionService();
    const session = await service.resumeSession(input);
    revalidateWorkSessionPaths(session);
    return { success: true, data: session };
  } catch (error) {
    if (WorkSessionService.isValidationError(error)) {
      return {
        success: false,
        error: WorkSessionService.getValidationMessage(error),
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to resume work session.",
    };
  }
}

export async function completeWorkSessionAction(
  input: CompleteWorkSessionInput
): Promise<WorkSessionActionResult<WorkSession>> {
  try {
    const service = await getWorkSessionService();
    const session = await service.completeSession(input);
    revalidateWorkSessionPaths(session);
    return { success: true, data: session };
  } catch (error) {
    if (WorkSessionService.isValidationError(error)) {
      return {
        success: false,
        error: WorkSessionService.getValidationMessage(error),
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to complete work session.",
    };
  }
}

export async function findRunningWorkSessionAction(): Promise<
  WorkSessionActionResult<WorkSession | null>
> {
  try {
    const service = await getWorkSessionService();
    const session = await service.findRunningSession();
    return { success: true, data: session };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load running work session.",
    };
  }
}

export async function findWorkSessionsByPhaseAction(
  input: FindWorkSessionsByPhaseInput
): Promise<WorkSessionActionResult<WorkSession[]>> {
  try {
    const service = await getWorkSessionService();
    const sessions = await service.findByPhase(input);
    return { success: true, data: sessions };
  } catch (error) {
    if (WorkSessionService.isValidationError(error)) {
      return {
        success: false,
        error: WorkSessionService.getValidationMessage(error),
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : bg.validation.failed,
    };
  }
}

export async function logManualWorkSessionAction(
  input: LogManualWorkSessionInput
): Promise<WorkSessionActionResult<WorkSession>> {
  try {
    const service = await getWorkSessionService();
    const session = await service.logManualSession(input);
    revalidateWorkSessionPaths(session);
    return { success: true, data: session };
  } catch (error) {
    if (WorkSessionService.isValidationError(error)) {
      return {
        success: false,
        error: WorkSessionService.getValidationMessage(error),
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : bg.workSessionManual.logFailed,
    };
  }
}

export async function updateManualWorkSessionAction(
  input: UpdateManualWorkSessionInput
): Promise<WorkSessionActionResult<WorkSession>> {
  try {
    const service = await getWorkSessionService();
    const session = await service.updateManualSession(input);
    revalidateWorkSessionPaths(session);
    return { success: true, data: session };
  } catch (error) {
    if (WorkSessionService.isValidationError(error)) {
      return {
        success: false,
        error: WorkSessionService.getValidationMessage(error),
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : bg.workSessionManual.updateFailed,
    };
  }
}

export async function deleteWorkSessionAction(
  input: DeleteWorkSessionInput
): Promise<WorkSessionActionResult<WorkSession>> {
  try {
    const service = await getWorkSessionService();
    const session = await service.deleteSession(input);
    revalidateWorkSessionPaths(session);
    return { success: true, data: session };
  } catch (error) {
    if (WorkSessionService.isValidationError(error)) {
      return {
        success: false,
        error: WorkSessionService.getValidationMessage(error),
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : bg.workSessionManual.deleteFailed,
    };
  }
}

export async function completeStageManuallyAction(
  input: CompleteStageManuallyInput
): Promise<WorkSessionActionResult<void>> {
  try {
    const validatedInput = completeStageManuallySchema.parse(input);
    const workSessionService = await getWorkSessionService();
    const workflowStageCompletionService = await getWorkflowStageCompletionService();

    let resolvedRoomId = validatedInput.room_id ?? null;

    if (!resolvedRoomId) {
      const database = await getCachedSupabaseServerClient();
      const phase = await new PhaseRepository(database).findById(validatedInput.phase_id);

      if (!phase) {
        return { success: false, error: bg.validation.failed };
      }

      resolvedRoomId = phase.room_id;
    }

    await workSessionService.forceCompletePhaseSession({
      phase_id: validatedInput.phase_id,
      note: validatedInput.note ?? null,
    });

    const remainingMinutes = await workSessionService.resolveStageCompletionMinutes({
      phase_id: validatedInput.phase_id,
      actual_hours: validatedInput.actual_hours,
    });

    if (remainingMinutes > 0) {
      await workSessionService.createManualSessionForRemainingHours({
        project_id: validatedInput.project_id,
        room_id: resolvedRoomId,
        phase_id: validatedInput.phase_id,
        target_minutes: remainingMinutes,
        note: validatedInput.note ?? null,
      });
    }

    await workflowStageCompletionService.completeStageFromLegacyPhase({
      project_id: validatedInput.project_id,
      legacy_phase_id: validatedInput.phase_id,
      move_to_next_stage: validatedInput.move_to_next_stage,
    });

    revalidatePath("/");
    revalidatePath(`/projects/${validatedInput.project_id}`);

    if (resolvedRoomId) {
      revalidatePath(
        `/projects/${validatedInput.project_id}/rooms/${resolvedRoomId}`
      );
    }

    return { success: true, data: undefined };
  } catch (error) {
    if (WorkSessionService.isValidationError(error)) {
      return {
        success: false,
        error: WorkSessionService.getValidationMessage(error),
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : bg.workSessionManual.completeStageFailed,
    };
  }
}
