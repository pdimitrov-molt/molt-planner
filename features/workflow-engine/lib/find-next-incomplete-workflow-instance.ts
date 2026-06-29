import type { WorkflowStageInstance } from "@/features/workflow-engine/types/workflow-engine";

function isInstanceComplete(instance: WorkflowStageInstance): boolean {
  return instance.status === "completed" || instance.progress_percent >= 100;
}

export function findNextIncompleteWorkflowInstance(
  instances: WorkflowStageInstance[],
  completedInstanceId: string
): WorkflowStageInstance | null {
  const enabled = instances
    .filter((instance) => instance.enabled)
    .sort((left, right) => left.sort_order - right.sort_order);

  const completedIndex = enabled.findIndex((instance) => instance.id === completedInstanceId);

  if (completedIndex === -1) {
    return enabled.find((instance) => !isInstanceComplete(instance)) ?? null;
  }

  for (let index = completedIndex + 1; index < enabled.length; index += 1) {
    if (!isInstanceComplete(enabled[index])) {
      return enabled[index];
    }
  }

  return null;
}

export function isWorkflowProjectComplete(instances: WorkflowStageInstance[]): boolean {
  const enabled = instances.filter((instance) => instance.enabled);

  if (enabled.length === 0) {
    return false;
  }

  return enabled.every(isInstanceComplete);
}
