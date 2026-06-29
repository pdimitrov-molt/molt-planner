export const WORKFLOW_WAITING_REASONS = [
  "client_approval",
  "presentation",
  "payment",
  "measurements",
  "supplier",
  "furniture_production",
  "contractor",
  "delivery",
  "other",
] as const;

export type WorkflowWaitingReason = (typeof WORKFLOW_WAITING_REASONS)[number];

export const WORKFLOW_WAITING_STATUSES = [
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
] as const;

export type WorkflowWaitingStatus = (typeof WORKFLOW_WAITING_STATUSES)[number];

export interface WorkflowWaitingEvent {
  id: string;
  project_id: string;
  workflow_instance_id: string;
  reason: WorkflowWaitingReason;
  custom_reason: string | null;
  started_at: string;
  expected_end_at: string | null;
  ended_at: string | null;
  status: WorkflowWaitingStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WorkflowWaitingEventRow {
  id: string;
  project_id: string;
  workflow_instance_id: string;
  reason: string;
  custom_reason: string | null;
  started_at: string;
  expected_end_at: string | null;
  ended_at: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export function isWorkflowWaitingReason(value: string): value is WorkflowWaitingReason {
  return WORKFLOW_WAITING_REASONS.includes(value as WorkflowWaitingReason);
}

export function isWorkflowWaitingStatus(value: string): value is WorkflowWaitingStatus {
  return WORKFLOW_WAITING_STATUSES.includes(value as WorkflowWaitingStatus);
}

export function mapWorkflowWaitingEventRow(
  row: WorkflowWaitingEventRow
): WorkflowWaitingEvent {
  if (!isWorkflowWaitingReason(row.reason)) {
    throw new Error(`Invalid workflow waiting reason: ${row.reason}`);
  }

  if (!isWorkflowWaitingStatus(row.status)) {
    throw new Error(`Invalid workflow waiting status: ${row.status}`);
  }

  return {
    id: row.id,
    project_id: row.project_id,
    workflow_instance_id: row.workflow_instance_id,
    reason: row.reason,
    custom_reason: row.custom_reason,
    started_at: row.started_at,
    expected_end_at: row.expected_end_at,
    ended_at: row.ended_at,
    status: row.status,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
    deleted_at: row.deleted_at,
  };
}
