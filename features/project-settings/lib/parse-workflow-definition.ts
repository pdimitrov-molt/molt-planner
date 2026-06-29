import type { ProjectWorkflowDefinition } from "@/features/project-settings/types/project-workflow-stage";
import type { ProjectWorkflowStage } from "@/features/project-settings/types/project-workflow-stage";
import {
  buildDefaultWorkflowStages,
} from "@/features/project-settings/data/workflow-type-templates";
import {
  DEFAULT_WORKFLOW_TYPE,
  isWorkflowType,
  type WorkflowType,
} from "@/features/project-settings/types/workflow-type";
import { isPhaseKind } from "@/features/phases/types/phase";

function isStage(value: unknown): value is ProjectWorkflowStage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const stage = value as Record<string, unknown>;

  return (
    typeof stage.id === "string" &&
    typeof stage.key === "string" &&
    typeof stage.label === "string" &&
    typeof stage.enabled === "boolean" &&
    typeof stage.estimated_hours === "number" &&
    typeof stage.sort_order === "number" &&
    (stage.phase_kind === null ||
      (typeof stage.phase_kind === "string" && isPhaseKind(stage.phase_kind)))
  );
}

export function parseWorkflowDefinition(
  raw: unknown,
  workflowType: WorkflowType
): ProjectWorkflowStage[] {
  if (!raw || typeof raw !== "object") {
    return buildDefaultWorkflowStages(workflowType);
  }

  if (Array.isArray(raw)) {
    return buildDefaultWorkflowStages(workflowType);
  }

  const definition = raw as ProjectWorkflowDefinition;
  const stages = definition.stages;

  if (!Array.isArray(stages) || stages.length === 0 || !stages.every(isStage)) {
    return buildDefaultWorkflowStages(workflowType);
  }

  return [...stages]
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((stage, index) => ({
      ...stage,
      sort_order: index,
    }));
}

export function serializeWorkflowDefinition(
  stages: ProjectWorkflowStage[]
): ProjectWorkflowDefinition {
  return {
    stages: stages.map((stage, index) => ({
      ...stage,
      sort_order: index,
    })),
  };
}

export function resolveWorkflowType(value: string | null | undefined): WorkflowType {
  if (value && isWorkflowType(value)) {
    return value;
  }

  return DEFAULT_WORKFLOW_TYPE;
}

export function normalizeWorkflowStages(
  stages: ProjectWorkflowStage[]
): ProjectWorkflowStage[] {
  return stages.map((stage, index) => ({
    ...stage,
    label: stage.label.trim(),
    estimated_hours: Math.max(0.5, stage.estimated_hours),
    sort_order: index,
  }));
}
