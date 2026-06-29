import { resolveDocumentItemsForStage } from "@/features/workflow-engine/data/default-document-items";
import { instanceTypeFromExecutionMode } from "@/features/workflow-engine/lib/workflow-execution-mode";
import { resolveGroupRoomIds } from "@/features/workflow-engine/lib/workflow-scope";
import type {
  HierarchicalWorkflowDefinition,
  WorkflowStageExecutionMode,
  WorkflowStageInstance,
  WorkflowStageInstanceType,
} from "@/features/workflow-engine/types/workflow-engine";

export interface PlannedWorkflowStageInstance {
  group_key: string;
  stage_key: string;
  group_name: string;
  stage_name: string;
  definition_group_id: string;
  definition_stage_id: string;
  execution_mode: WorkflowStageExecutionMode;
  instance_type: WorkflowStageInstanceType;
  room_id: string | null;
  document_key: string | null;
  document_name: string | null;
  estimated_minutes: number;
  sort_order: number;
  enabled: boolean;
}

export interface PlanWorkflowStageInstancesInput {
  project_id: string;
  definition: HierarchicalWorkflowDefinition;
  rooms: Array<{ id: string; name: string }>;
}

function hoursToMinutes(hours: number): number {
  return Math.max(0, Math.round(hours * 60));
}

export function planWorkflowStageInstances(
  input: PlanWorkflowStageInstancesInput
): PlannedWorkflowStageInstance[] {
  const planned: PlannedWorkflowStageInstance[] = [];

  for (const group of input.definition.groups) {
    if (!group.enabled) {
      continue;
    }

    for (const stage of group.stages) {
      if (!stage.enabled) {
        continue;
      }

      const base = {
        group_key: group.key,
        stage_key: stage.key,
        group_name: group.name,
        stage_name: stage.name,
        definition_group_id: group.id,
        definition_stage_id: stage.id,
        execution_mode: stage.execution_mode,
        instance_type: instanceTypeFromExecutionMode(stage.execution_mode),
        estimated_minutes: hoursToMinutes(stage.estimated_hours),
        sort_order: stage.sort_order,
        enabled: true,
      };

      switch (stage.execution_mode) {
        case "PROJECT":
          planned.push({
            ...base,
            room_id: null,
            document_key: null,
            document_name: null,
          });
          break;

        case "ROOMS": {
          const roomIds = resolveGroupRoomIds(group, input.rooms);

          for (const roomId of roomIds) {
            planned.push({
              ...base,
              room_id: roomId,
              document_key: null,
              document_name: null,
            });
          }

          break;
        }

        case "DOCUMENTS": {
          const documentItems = resolveDocumentItemsForStage(stage.document_items);

          for (const documentItem of documentItems) {
            planned.push({
              ...base,
              room_id: null,
              document_key: documentItem.key,
              document_name: documentItem.name,
              sort_order: stage.sort_order * 100 + documentItem.sort_order,
            });
          }

          break;
        }
      }
    }
  }

  return planned;
}

export function workflowStageInstanceIdentityKey(instance: {
  group_key: string;
  stage_key: string;
  room_id: string | null;
  document_key: string | null;
}): string {
  return `${instance.group_key}:${instance.stage_key}:${instance.room_id ?? "project"}:${instance.document_key ?? "none"}`;
}

export function matchesPlannedWorkflowStageInstance(
  existing: Pick<
    WorkflowStageInstance,
    "group_key" | "stage_key" | "room_id" | "document_key"
  >,
  planned: PlannedWorkflowStageInstance
): boolean {
  return workflowStageInstanceIdentityKey(existing) === workflowStageInstanceIdentityKey(planned);
}

/** @deprecated Use planWorkflowStageInstances */
export const planStageInstances = planWorkflowStageInstances;

/** @deprecated Use PlannedWorkflowStageInstance */
export type PlannedStageInstance = PlannedWorkflowStageInstance;

/** @deprecated Use matchesPlannedWorkflowStageInstance */
export const matchesPlannedInstance = matchesPlannedWorkflowStageInstance;

/** @deprecated Use workflowStageInstanceIdentityKey */
export const instanceIdentityKey = workflowStageInstanceIdentityKey;

/** @deprecated Use workflowStageInstanceIdentityKey */
export const instanceIdentityKeyFromRow = workflowStageInstanceIdentityKey;
