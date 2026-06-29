import type { WorkflowWaitingReason } from "@/features/workflow-engine/types/workflow-waiting-event";
import { bg } from "@/src/i18n/bg";

export const WORKFLOW_WAITING_REASON_OPTIONS: WorkflowWaitingReason[] = [
  "client_approval",
  "presentation",
  "payment",
  "measurements",
  "supplier",
  "delivery",
  "contractor",
  "furniture_production",
  "other",
];

export function getWaitingReasonLabel(
  reason: WorkflowWaitingReason,
  customReason?: string | null
): string {
  if (reason === "other") {
    return customReason?.trim() || bg.workflowWaiting.reasons.other;
  }

  return bg.workflowWaiting.reasons[reason];
}
