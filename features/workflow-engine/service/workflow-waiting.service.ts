import { ZodError } from "zod";

import { WorkflowWaitingRepository } from "@/features/workflow-engine/repository/workflow-waiting.repository";
import type { WorkflowWaitingEvent } from "@/features/workflow-engine/types/workflow-waiting-event";
import {
  cancelWaitingSchema,
  finishWaitingSchema,
  getCurrentWaitingSchema,
  startWaitingSchema,
  type CancelWaitingInput,
  type FinishWaitingInput,
  type GetCurrentWaitingInput,
  type StartWaitingInput,
} from "@/features/workflow-engine/validation/workflow-waiting.schema";

export class WorkflowWaitingService {
  constructor(private readonly repository: WorkflowWaitingRepository) {}

  async startWaiting(input: StartWaitingInput): Promise<WorkflowWaitingEvent> {
    const validated = startWaitingSchema.parse(input);
    const instance = await this.repository.findWorkflowInstanceProject(
      validated.workflow_instance_id
    );

    if (!instance) {
      throw new Error("Workflow stage instance was not found.");
    }

    if (instance.project_id !== validated.project_id) {
      throw new Error("Stage instance does not belong to this project.");
    }

    const active = await this.repository.findActive(validated.workflow_instance_id);

    if (active) {
      throw new Error("This stage already has an active waiting event.");
    }

    return this.repository.create({
      project_id: validated.project_id,
      workflow_instance_id: validated.workflow_instance_id,
      reason: validated.reason,
      custom_reason: validated.custom_reason ?? null,
      expected_end_at: validated.expected_end_at ?? null,
      notes: validated.notes ?? null,
    });
  }

  async finishWaiting(input: FinishWaitingInput): Promise<WorkflowWaitingEvent> {
    const validated = finishWaitingSchema.parse(input);
    const active = await this.repository.findActive(validated.workflow_instance_id);

    if (!active) {
      throw new Error("Active waiting event was not found.");
    }

    return this.repository.finish(active.id);
  }

  async cancelWaiting(input: CancelWaitingInput): Promise<WorkflowWaitingEvent> {
    const validated = cancelWaitingSchema.parse(input);
    const active = await this.repository.findActive(validated.workflow_instance_id);

    if (!active) {
      throw new Error("Active waiting event was not found.");
    }

    return this.repository.cancel(active.id);
  }

  async getCurrentWaiting(
    input: GetCurrentWaitingInput
  ): Promise<WorkflowWaitingEvent | null> {
    const validated = getCurrentWaitingSchema.parse(input);
    return this.repository.findActive(validated.workflow_instance_id);
  }

  getWaitingHistory(workflowInstanceId: string): Promise<WorkflowWaitingEvent[]> {
    return this.repository.findHistory(workflowInstanceId);
  }

  static isValidationError(error: unknown): error is ZodError {
    return error instanceof ZodError;
  }

  static getValidationMessage(error: ZodError): string {
    return error.issues[0]?.message ?? "Validation failed.";
  }
}
