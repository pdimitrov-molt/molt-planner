import {
  OBSOLETE_WORKFLOW_GROUP_KEYS,
  OBSOLETE_WORKFLOW_STAGE_KEYS,
  buildDesignWorkflowForPackage,
} from "@/features/workflow-engine/data/default-design-workflow";
import type { ProjectPackage } from "@/features/projects/types/project";
import type { HierarchicalWorkflowDefinition } from "@/features/workflow-engine/types/workflow-engine";

/** Maps legacy prototype stage keys to approved interior design stage keys. */
export const LEGACY_STAGE_KEY_TO_APPROVED: Record<string, string> = {
  site_visit_measurements: "object_inspection",
  site_survey: "object_inspection",
  existing_drawings: "photography",
  functional_layouts: "functional_layout",
  client_presentation: "presentation",
  modelling_3d: "visualizations_3d",
  quantity_survey: "quantity_estimates",
  drawing_deliverables: "architectural_drawings",
  supplier_documentation: "orders",
  final_delivery: "final_package",
  floor_plans: "architectural_drawings",
  furniture_drawings: "furniture_drawings",
  specifications: "specifications",
  design_concept: "design_concept",
};

const OBSOLETE_GROUP_KEY_SET = new Set<string>(OBSOLETE_WORKFLOW_GROUP_KEYS);
const OBSOLETE_STAGE_KEY_SET = new Set<string>(OBSOLETE_WORKFLOW_STAGE_KEYS);

export function collectWorkflowStageKeys(
  definition: HierarchicalWorkflowDefinition
): Set<string> {
  return new Set(
    definition.groups.flatMap((group) => group.stages.map((stage) => stage.key))
  );
}

export function collectWorkflowGroupKeys(
  definition: HierarchicalWorkflowDefinition
): Set<string> {
  return new Set(definition.groups.map((group) => group.key));
}

export function needsWorkflowDefinitionMigration(
  definition: HierarchicalWorkflowDefinition
): boolean {
  const groupKeys = collectWorkflowGroupKeys(definition);
  const stageKeys = collectWorkflowStageKeys(definition);

  for (const groupKey of groupKeys) {
    if (OBSOLETE_GROUP_KEY_SET.has(groupKey)) {
      return true;
    }
  }

  for (const stageKey of stageKeys) {
    if (OBSOLETE_STAGE_KEY_SET.has(stageKey)) {
      return true;
    }
  }

  if (!groupKeys.has("conceptual_design")) {
    return true;
  }

  if (!groupKeys.has("schematic_design")) {
    return true;
  }

  if (!groupKeys.has("working_project")) {
    return true;
  }

  if (!groupKeys.has("documentation")) {
    return true;
  }

  return false;
}

export function migrateWorkflowDefinitionForPackage(
  projectPackage: ProjectPackage
): HierarchicalWorkflowDefinition {
  return buildDesignWorkflowForPackage(projectPackage);
}

export function resolveApprovedStageKey(stageKey: string): string {
  return LEGACY_STAGE_KEY_TO_APPROVED[stageKey] ?? stageKey;
}

export function stageKeysMatchForMigration(
  existingStageKey: string,
  targetStageKey: string
): boolean {
  if (existingStageKey === targetStageKey) {
    return true;
  }

  return resolveApprovedStageKey(existingStageKey) === targetStageKey;
}
