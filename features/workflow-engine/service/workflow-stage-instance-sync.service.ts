import type { PhaseKind } from "@/features/phases/types/phase";
import {
  matchesPlannedWorkflowStageInstance,
  planWorkflowStageInstances,
  type PlannedWorkflowStageInstance,
} from "@/features/workflow-engine/lib/plan-workflow-stage-instances";
import { stageKeysMatchForMigration } from "@/features/workflow-engine/lib/workflow-definition-migration";
import { minutesToEstimatedHours } from "@/features/workflow-engine/lib/workflow-execution-mode";
import { WorkflowStageInstanceRepository } from "@/features/workflow-engine/repository/workflow-stage-instance.repository";
import type {
  HierarchicalWorkflowDefinition,
  WorkflowStageInstance,
} from "@/features/workflow-engine/types/workflow-engine";

const WORKFLOW_PHASE_SORT_BASE = 10_000;

export interface WorkflowStageInstanceSyncInput {
  project_id: string;
  definition: HierarchicalWorkflowDefinition;
  rooms: Array<{ id: string; name: string }>;
}

function resolveAnchorRoomId(rooms: Array<{ id: string }>): string | null {
  return rooms[0]?.id ?? null;
}

function resolveStagePhaseKind(
  planned: PlannedWorkflowStageInstance,
  definition: HierarchicalWorkflowDefinition
): PhaseKind {
  for (const group of definition.groups) {
    const stage = group.stages.find((entry) => entry.id === planned.definition_stage_id);

    if (stage?.legacy_phase_kind) {
      return stage.legacy_phase_kind;
    }
  }

  return "documentation";
}

function resolvePhaseRoomId(
  planned: PlannedWorkflowStageInstance,
  anchorRoomId: string | null
): string | null {
  if (planned.room_id) {
    return planned.room_id;
  }

  return anchorRoomId;
}

function findMatchingExistingInstance(
  existing: WorkflowStageInstance[],
  target: PlannedWorkflowStageInstance,
  matchedExistingIds: Set<string>
): WorkflowStageInstance | null {
  const exact = existing.find(
    (entry) =>
      !matchedExistingIds.has(entry.id) && matchesPlannedWorkflowStageInstance(entry, target)
  );

  if (exact) {
    return exact;
  }

  return (
    existing.find(
      (entry) =>
        !matchedExistingIds.has(entry.id) &&
        entry.room_id === target.room_id &&
        entry.document_key === target.document_key &&
        stageKeysMatchForMigration(entry.stage_key, target.stage_key)
    ) ?? null
  );
}

export class WorkflowStageInstanceSyncService {
  constructor(private readonly repository: WorkflowStageInstanceRepository) {}

  async sync(input: WorkflowStageInstanceSyncInput): Promise<WorkflowStageInstance[]> {
    const anchorRoomId = resolveAnchorRoomId(input.rooms);

    if (!anchorRoomId) {
      return [];
    }

    const planned = planWorkflowStageInstances({
      project_id: input.project_id,
      definition: input.definition,
      rooms: input.rooms,
    });

    const existing = await this.repository.findByProject(input.project_id);
    const matchedExistingIds = new Set<string>();
    const synced: WorkflowStageInstance[] = [];

    for (const target of planned) {
      const current = findMatchingExistingInstance(existing, target, matchedExistingIds);

      if (current) {
        matchedExistingIds.add(current.id);
        const updated = await this.repository.update(current.id, {
          group_key: target.group_key,
          group_name: target.group_name,
          stage_key: target.stage_key,
          stage_name: target.stage_name,
          execution_mode: target.execution_mode,
          instance_type: target.instance_type,
          estimated_minutes: target.estimated_minutes,
          sort_order: target.sort_order,
          enabled: target.enabled,
        });

        synced.push(updated);
        continue;
      }

      const phaseRoomId = resolvePhaseRoomId(target, anchorRoomId);

      if (!phaseRoomId) {
        continue;
      }

      const legacyPhaseId = await this.repository.createLegacyWorkflowPhase({
        room_id: phaseRoomId,
        phase_kind: resolveStagePhaseKind(target, input.definition),
        estimated_hours: minutesToEstimatedHours(target.estimated_minutes),
        sort_order: WORKFLOW_PHASE_SORT_BASE + target.sort_order,
        status: "not_started",
      });

      const created = await this.repository.insert({
        project_id: input.project_id,
        group_key: target.group_key,
        stage_key: target.stage_key,
        group_name: target.group_name,
        stage_name: target.stage_name,
        execution_mode: target.execution_mode,
        instance_type: target.instance_type,
        room_id: target.room_id,
        document_key: target.document_key,
        estimated_minutes: target.estimated_minutes,
        sort_order: target.sort_order,
        enabled: target.enabled,
        legacy_phase_id: legacyPhaseId,
      });

      synced.push(created);
    }

    const staleIds = existing
      .filter((entry) => !matchedExistingIds.has(entry.id))
      .map((entry) => entry.id);

    await this.repository.softDelete(staleIds);

    return synced.sort((left, right) => left.sort_order - right.sort_order);
  }
}

/** @deprecated Use WorkflowStageInstanceSyncService */
export class StageInstanceSyncService extends WorkflowStageInstanceSyncService {
  async syncProjectInstances(input: WorkflowStageInstanceSyncInput): Promise<WorkflowStageInstance[]> {
    return this.sync(input);
  }
}
