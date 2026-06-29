"use server";

import { revalidatePath } from "next/cache";

import { getWorkflowWaitingService } from "@/features/workflow-engine/service/get-workflow-waiting-service";
import { WorkflowWaitingService } from "@/features/workflow-engine/service/workflow-waiting.service";
import type { WorkflowWaitingEvent } from "@/features/workflow-engine/types/workflow-waiting-event";
import {
  cancelWaitingSchema,
  finishWaitingSchema,
  startWaitingSchema,
  type CancelWaitingInput,
  type FinishWaitingInput,
  type StartWaitingInput,
} from "@/features/workflow-engine/validation/workflow-waiting.schema";

export type WorkflowWaitingActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function revalidateProjectPaths(projectId: string) {
  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
}

export async function startWaitingAction(
  input: StartWaitingInput
): Promise<WorkflowWaitingActionResult<WorkflowWaitingEvent>> {
  try {
    const validated = startWaitingSchema.parse(input);
    const service = await getWorkflowWaitingService();
    const event = await service.startWaiting(validated);
    revalidateProjectPaths(validated.project_id);
    return { success: true, data: event };
  } catch (error) {
    if (WorkflowWaitingService.isValidationError(error)) {
      return {
        success: false,
        error: WorkflowWaitingService.getValidationMessage(error),
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to start waiting.",
    };
  }
}

export async function finishWaitingAction(
  input: FinishWaitingInput
): Promise<WorkflowWaitingActionResult<WorkflowWaitingEvent>> {
  try {
    const validated = finishWaitingSchema.parse(input);
    const service = await getWorkflowWaitingService();
    const event = await service.finishWaiting(validated);
    revalidateProjectPaths(event.project_id);
    return { success: true, data: event };
  } catch (error) {
    if (WorkflowWaitingService.isValidationError(error)) {
      return {
        success: false,
        error: WorkflowWaitingService.getValidationMessage(error),
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to finish waiting.",
    };
  }
}

export async function cancelWaitingAction(
  input: CancelWaitingInput
): Promise<WorkflowWaitingActionResult<WorkflowWaitingEvent>> {
  try {
    const validated = cancelWaitingSchema.parse(input);
    const service = await getWorkflowWaitingService();
    const event = await service.cancelWaiting(validated);
    revalidateProjectPaths(event.project_id);
    return { success: true, data: event };
  } catch (error) {
    if (WorkflowWaitingService.isValidationError(error)) {
      return {
        success: false,
        error: WorkflowWaitingService.getValidationMessage(error),
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel waiting.",
    };
  }
}
