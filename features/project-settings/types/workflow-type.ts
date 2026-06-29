import { bg } from "@/src/i18n/bg";

export const WORKFLOW_TYPES = [
  "interior_design",
  "interior_design_execution",
  "execution_only",
  "exterior_design",
  "exterior_execution",
  "consultation",
  "author_supervision",
] as const;

export type WorkflowType = (typeof WORKFLOW_TYPES)[number];

export const WORKFLOW_TYPE_LABELS: Record<WorkflowType, string> =
  bg.projects.settings.workflowTypes;

export function isWorkflowType(value: string): value is WorkflowType {
  return WORKFLOW_TYPES.includes(value as WorkflowType);
}

export const DEFAULT_WORKFLOW_TYPE: WorkflowType = "interior_design";
