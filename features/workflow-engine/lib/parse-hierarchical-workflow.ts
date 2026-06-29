import type { PhaseKind } from "@/features/phases/types/phase";
import { isPhaseKind } from "@/features/phases/types/phase";
import { buildDefaultDesignWorkflow } from "@/features/workflow-engine/data/default-design-workflow";
import { normalizeExecutionMode } from "@/features/workflow-engine/lib/workflow-execution-mode";
import {
  normalizeGroupDefinition,
  normalizeGroupScope,
  normalizeStageDefinition,
} from "@/features/workflow-engine/lib/workflow-scope";
import type {
  HierarchicalWorkflowDefinition,
  WorkflowGroupDefinition,
  WorkflowGroupScope,
  WorkflowStageDefinition,
  WorkflowStageExecutionMode,
} from "@/features/workflow-engine/types/workflow-engine";
import { WORKFLOW_STAGE_EXECUTION_MODES } from "@/features/workflow-engine/types/workflow-engine";

function normalizeExecutionModeFromRaw(
  value: unknown,
  itemType: unknown,
  scope: unknown,
  roomRequired: unknown,
  groupScope?: WorkflowGroupScope
): WorkflowStageExecutionMode {
  if (
    typeof value === "string" &&
    WORKFLOW_STAGE_EXECUTION_MODES.includes(value as WorkflowStageExecutionMode)
  ) {
    return value as WorkflowStageExecutionMode;
  }

  return normalizeExecutionMode(
    {
      execution_mode: "PROJECT",
      item_type:
        itemType === "ROOM_ITEM" || scope === "room" || roomRequired === true
          ? "ROOM_ITEM"
          : "PROJECT_ITEM",
      scope: scope === "room" ? "room" : scope === "project" ? "project" : undefined,
      room_required: roomRequired === true,
    },
    groupScope
  );
}

function normalizeGroupScopeFromRaw(
  value: unknown,
  stages: unknown[]
): WorkflowGroupScope {
  if (value === "PROJECT" || value === "ROOM") {
    return value;
  }

  const hasRoomStage = stages.some((stage) => {
    if (!stage || typeof stage !== "object") {
      return false;
    }

    const record = stage as Record<string, unknown>;
    return (
      normalizeExecutionModeFromRaw(
        record.execution_mode,
        record.item_type,
        record.scope,
        record.room_required
      ) === "ROOMS"
    );
  });

  return hasRoomStage ? "ROOM" : "PROJECT";
}

function isStage(value: unknown, groupScope?: WorkflowGroupScope): value is WorkflowStageDefinition {
  if (!value || typeof value !== "object") {
    return false;
  }

  const stage = value as Record<string, unknown>;
  const executionMode = normalizeExecutionModeFromRaw(
    stage.execution_mode,
    stage.item_type,
    stage.scope,
    stage.room_required,
    groupScope
  );

  return (
    typeof stage.id === "string" &&
    typeof stage.key === "string" &&
    typeof stage.name === "string" &&
    typeof stage.sort_order === "number" &&
    typeof stage.estimated_hours === "number" &&
    typeof stage.enabled === "boolean" &&
    WORKFLOW_STAGE_EXECUTION_MODES.includes(executionMode) &&
    Array.isArray(stage.room_ids) &&
    (stage.document_items === undefined ||
      (Array.isArray(stage.document_items) &&
        stage.document_items.every(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof (item as Record<string, unknown>).id === "string" &&
            typeof (item as Record<string, unknown>).key === "string" &&
            typeof (item as Record<string, unknown>).name === "string"
        ))) &&
    (stage.legacy_phase_kind === null ||
      (typeof stage.legacy_phase_kind === "string" &&
        isPhaseKind(stage.legacy_phase_kind)))
  );
}

function isGroup(value: unknown): value is WorkflowGroupDefinition {
  if (!value || typeof value !== "object") {
    return false;
  }

  const group = value as Record<string, unknown>;
  const groupScope = normalizeGroupScopeFromRaw(
    group.scope,
    Array.isArray(group.stages) ? group.stages : []
  );

  return (
    typeof group.id === "string" &&
    typeof group.key === "string" &&
    typeof group.name === "string" &&
    typeof group.sort_order === "number" &&
    typeof group.estimated_hours === "number" &&
    typeof group.enabled === "boolean" &&
    Array.isArray(group.stages) &&
    group.stages.every((stage) => isStage(stage, groupScope)) &&
    (group.scope === undefined ||
      group.scope === "PROJECT" ||
      group.scope === "ROOM") &&
    (group.room_ids === undefined || Array.isArray(group.room_ids))
  );
}

function isHierarchicalDefinition(
  value: unknown
): value is HierarchicalWorkflowDefinition {
  if (!value || typeof value !== "object") {
    return false;
  }

  const definition = value as Record<string, unknown>;

  return (
    definition.version === 2 &&
    Array.isArray(definition.groups) &&
    definition.groups.every(isGroup)
  );
}

function normalizeGroups(
  groups: WorkflowGroupDefinition[]
): WorkflowGroupDefinition[] {
  return groups
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((group, groupIndex) => {
      const scope = normalizeGroupScope({
        scope: normalizeGroupScopeFromRaw(group.scope, group.stages),
        stages: group.stages,
      });

      return normalizeGroupDefinition({
        ...group,
        sort_order: groupIndex,
        scope,
        room_ids: Array.isArray(group.room_ids) ? group.room_ids : [],
        stages: [...group.stages]
          .sort((left, right) => left.sort_order - right.sort_order)
          .map((stage, stageIndex) =>
            normalizeStageDefinition(
              {
                ...stage,
                sort_order: stageIndex,
              },
              scope
            )
          ),
      });
    });
}

export function parseHierarchicalWorkflow(raw: unknown): HierarchicalWorkflowDefinition {
  if (isHierarchicalDefinition(raw)) {
    return {
      version: 2,
      groups: normalizeGroups(raw.groups),
    };
  }

  return buildDefaultDesignWorkflow();
}

export function serializeHierarchicalWorkflow(
  definition: HierarchicalWorkflowDefinition
): HierarchicalWorkflowDefinition {
  return {
    version: 2,
    groups: normalizeGroups(definition.groups).map((group) => ({
      ...group,
      stages: group.stages.map(
        ({ scope: _scope, room_required: _legacy, ...stage }) => stage
      ),
    })),
  };
}

export function hasPersistedHierarchicalWorkflow(raw: unknown): boolean {
  return isHierarchicalDefinition(raw) && raw.groups.length > 0;
}

export function findStagePhaseKind(stage: WorkflowStageDefinition): PhaseKind | null {
  return stage.legacy_phase_kind;
}
