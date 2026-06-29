import type { WorkflowGroupDefinition } from "@/features/workflow-engine/types/workflow-engine";

export function recalculateGroupHours(
  group: WorkflowGroupDefinition
): WorkflowGroupDefinition {
  return {
    ...group,
    estimated_hours: group.stages.reduce(
      (total, stage) =>
        total + (stage.enabled && group.enabled ? stage.estimated_hours : 0),
      0
    ),
  };
}
