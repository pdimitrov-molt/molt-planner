"use server";

import { revalidatePath } from "next/cache";

import { getWorkSessionService } from "@/features/work-sessions/service/get-work-session-service";
import { WorkSessionService } from "@/features/work-sessions/service/work-session.service";
import type { WorkSession } from "@/features/work-sessions/types/work-session";
import type {
  CompleteWorkSessionInput,
  FindWorkSessionsByPhaseInput,
  PauseWorkSessionInput,
  ResumeWorkSessionInput,
  StartWorkSessionInput,
} from "@/features/work-sessions/validation/work-session.schema";
import { bg } from "@/src/i18n/bg";

export type WorkSessionActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function revalidateWorkSessionPaths(session: WorkSession) {
  revalidatePath("/");
  revalidatePath(`/projects/${session.project_id}`);
  revalidatePath(`/projects/${session.project_id}/rooms/${session.room_id}`);
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
