import type {
  WorkflowWaitingEvent,
  WorkflowWaitingReason,
} from "@/features/workflow-engine/types/workflow-waiting-event";

const OPTIMISTIC_WAITING_PREFIX = "optimistic-waiting";

export function isOptimisticWaitingEventId(eventId: string): boolean {
  return eventId.startsWith(OPTIMISTIC_WAITING_PREFIX);
}

export function buildOptimisticWaitingEvent(input: {
  projectId: string;
  workflowInstanceId: string;
  reason: WorkflowWaitingReason;
  custom_reason: string | null;
  expected_end_at: string | null;
  notes: string | null;
}): WorkflowWaitingEvent {
  const timestamp = new Date().toISOString();

  return {
    id: `${OPTIMISTIC_WAITING_PREFIX}-${input.workflowInstanceId}`,
    project_id: input.projectId,
    workflow_instance_id: input.workflowInstanceId,
    reason: input.reason,
    custom_reason: input.custom_reason,
    started_at: timestamp,
    expected_end_at: input.expected_end_at,
    ended_at: null,
    status: "ACTIVE",
    notes: input.notes,
    created_at: timestamp,
    updated_at: timestamp,
    deleted_at: null,
  };
}
