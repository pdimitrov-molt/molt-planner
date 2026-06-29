import type { ProjectWorkflowEngineView } from "@/features/workflow-engine/types/workflow-engine";

export function findWorkflowContextForPhase(
  workflow: ProjectWorkflowEngineView,
  timerTargetId: string
): {
  group_name: string;
  stage_name: string;
  room_name: string | null;
} | null {
  for (const group of workflow.groups) {
    for (const stage of group.stages) {
      const instanceMatch = stage.instances.find(
        (instance) => instance.timer_target_id === timerTargetId
      );

      if (instanceMatch) {
        return {
          group_name: group.name,
          stage_name:
            instanceMatch.document_item_name ??
            (instanceMatch.room_name
              ? `${stage.name} · ${instanceMatch.room_name}`
              : stage.name),
          room_name: instanceMatch.room_name,
        };
      }
    }
  }

  return null;
}
