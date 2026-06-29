import type {
  ProjectWorkflowEngineView,
  StageWorkData,
  WorkflowStageView,
} from "@/features/workflow-engine/types/workflow-engine";
import type { WorkflowWaitingEvent } from "@/features/workflow-engine/types/workflow-waiting-event";

export function buildActiveWaitingByInstanceId(
  events: WorkflowWaitingEvent[]
): Map<string, WorkflowWaitingEvent> {
  return new Map(events.map((event) => [event.workflow_instance_id, event]));
}

export function findActiveWaitingForInstance(
  stageWorkData: Record<string, StageWorkData>,
  instanceId: string | null
): WorkflowWaitingEvent | null {
  if (!instanceId) {
    return null;
  }

  for (const workData of Object.values(stageWorkData)) {
    const instance = workData.instances[instanceId];

    if (instance?.activeWaiting) {
      return instance.activeWaiting;
    }
  }

  return null;
}

export function resolveStageActiveWaiting(
  stage: WorkflowStageView,
  workData: StageWorkData | null,
  currentInstanceId: string | null
): WorkflowWaitingEvent | null {
  if (!workData) {
    return null;
  }

  if (stage.execution_mode === "PROJECT") {
    const instance = stage.instances[0];

    if (!instance) {
      return null;
    }

    return workData.instances[instance.id]?.activeWaiting ?? null;
  }

  if (!currentInstanceId) {
    return null;
  }

  return workData.instances[currentInstanceId]?.activeWaiting ?? null;
}

export function resolveWorkflowStageName(
  workflow: ProjectWorkflowEngineView,
  workflowInstanceId: string
): string | null {
  for (const group of workflow.groups) {
    for (const stage of group.stages) {
      const instance = stage.instances.find((entry) => entry.id === workflowInstanceId);

      if (instance) {
        return stage.name;
      }
    }
  }

  return null;
}
