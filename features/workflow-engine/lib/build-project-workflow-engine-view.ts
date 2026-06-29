import {
  aggregateStatus,
  averageProgress,
} from "@/features/workflow-engine/lib/calculate-workflow-progress";
import { minutesToEstimatedHours } from "@/features/workflow-engine/lib/workflow-execution-mode";
import {
  normalizeGroupDefinition,
  normalizeStageDefinition,
} from "@/features/workflow-engine/lib/workflow-scope";
import type {
  HierarchicalWorkflowDefinition,
  LegacyPhaseSnapshot,
  LegacyTaskSnapshot,
  ProjectWorkflowEngineView,
  WorkflowContextView,
  WorkflowGroupDefinition,
  WorkflowGroupView,
  WorkflowStageDefinition,
  WorkflowStageInstance,
  WorkflowStageInstanceView,
  WorkflowStageView,
} from "@/features/workflow-engine/types/workflow-engine";

interface BuildWorkflowEngineInput {
  project_id: string;
  definition: HierarchicalWorkflowDefinition;
  /** @deprecated Legacy snapshots kept for backward compatibility only */
  phases?: LegacyPhaseSnapshot[];
  /** @deprecated Legacy snapshots kept for backward compatibility only */
  tasks?: LegacyTaskSnapshot[];
  rooms: Array<{ id: string; name: string }>;
  instances: WorkflowStageInstance[];
}

function instancesForStage(
  instances: WorkflowStageInstance[],
  groupKey: string,
  stageKey: string
): WorkflowStageInstance[] {
  return instances
    .filter(
      (instance) =>
        instance.group_key === groupKey &&
        instance.stage_key === stageKey &&
        instance.enabled
    )
    .sort((left, right) => left.sort_order - right.sort_order);
}

function resolveDocumentItemName(input: {
  instance: WorkflowStageInstance;
  stage: WorkflowStageDefinition;
}): string | null {
  if (!input.instance.document_key) {
    return null;
  }

  const documentItem = input.stage.document_items?.find(
    (entry) => entry.key === input.instance.document_key
  );

  return documentItem?.name ?? input.instance.document_key;
}

function buildInstanceView(input: {
  instance: WorkflowStageInstance;
  stage: WorkflowStageDefinition;
  definitionStageId: string;
  rooms: Array<{ id: string; name: string }>;
  isCurrent: boolean;
}): WorkflowStageInstanceView {
  const room = input.rooms.find((entry) => entry.id === input.instance.room_id);
  const documentItemName = resolveDocumentItemName({
    instance: input.instance,
    stage: input.stage,
  });

  return {
    id: input.instance.id,
    stage_id: input.definitionStageId,
    execution_mode: input.instance.execution_mode,
    room_id: input.instance.room_id,
    room_name: room?.name ?? null,
    document_item_key: input.instance.document_key,
    document_item_name: documentItemName,
    status: input.instance.status,
    progress_percent: input.instance.progress_percent,
    estimated_minutes: input.instance.estimated_minutes,
    estimated_hours: minutesToEstimatedHours(input.instance.estimated_minutes),
    worked_minutes: input.instance.worked_minutes,
    sort_order: input.instance.sort_order,
    is_current: input.isCurrent,
    last_activity_at: input.instance.last_activity_at,
    completed_at: input.instance.completed_at,
    timer_target_id: input.instance.legacy_phase_id,
  };
}

function pickPrimaryInstance(
  instanceViews: WorkflowStageInstanceView[]
): WorkflowStageInstanceView | null {
  return (
    instanceViews.find((instance) => instance.status === "in_progress") ??
    instanceViews.find((instance) => instance.progress_percent < 100) ??
    instanceViews[0] ??
    null
  );
}

function buildStageView(
  stage: WorkflowStageDefinition,
  group: WorkflowGroupDefinition,
  input: BuildWorkflowEngineInput,
  currentInstanceId: string | null
): WorkflowStageView {
  const normalizedStage = normalizeStageDefinition(stage, group.scope);
  const stageInstances = instancesForStage(
    input.instances,
    group.key,
    normalizedStage.key
  );
  const instanceViews = stageInstances.map((instance) =>
    buildInstanceView({
      instance,
      stage: normalizedStage,
      definitionStageId: normalizedStage.id,
      rooms: input.rooms,
      isCurrent: instance.id === currentInstanceId,
    })
  );
  const progressValues = instanceViews.map((instance) => instance.progress_percent);
  const progress_percent = averageProgress(progressValues);
  const hasBlocked = instanceViews.some((instance) => instance.status === "blocked");

  return {
    id: normalizedStage.id,
    key: normalizedStage.key,
    name: normalizedStage.name,
    sort_order: normalizedStage.sort_order,
    estimated_hours: normalizedStage.estimated_hours,
    enabled: normalizedStage.enabled,
    execution_mode: normalizedStage.execution_mode,
    item_type: normalizedStage.item_type,
    room_ids: normalizedStage.room_ids,
    legacy_phase_kind: normalizedStage.legacy_phase_kind,
    progress_percent,
    status: aggregateStatus(progress_percent, hasBlocked),
    instances: instanceViews,
    is_current: false,
  };
}

function resolveCurrentContext(groups: WorkflowGroupView[]): WorkflowContextView | null {
  for (const group of groups) {
    if (!group.enabled) {
      continue;
    }

    for (const stage of group.stages) {
      if (!stage.enabled || stage.progress_percent >= 100) {
        continue;
      }

      const currentInstance =
        stage.instances.find((instance) => instance.is_current) ??
        stage.instances.find((instance) => instance.status === "in_progress") ??
        stage.instances.find((instance) => instance.progress_percent < 100) ??
        stage.instances[0];

      if (!currentInstance || currentInstance.progress_percent >= 100) {
        continue;
      }

      return {
        group_id: group.id,
        group_name: group.name,
        group_scope: group.scope,
        stage_id: stage.id,
        stage_name: stage.name,
        execution_mode: stage.execution_mode,
        item_type: stage.item_type,
        room_id: currentInstance.room_id,
        room_name: currentInstance.room_name,
        instance_id: currentInstance.id,
      };
    }
  }

  return null;
}

export function buildProjectWorkflowEngineView(
  input: BuildWorkflowEngineInput
): ProjectWorkflowEngineView {
  const normalizedDefinition: HierarchicalWorkflowDefinition = {
    version: 2,
    groups: input.definition.groups.map((group) => normalizeGroupDefinition(group)),
  };

  const preliminaryGroups: WorkflowGroupView[] = normalizedDefinition.groups.map((group) => {
    const stageViews = group.stages.map((stage) =>
      buildStageView(stage, group, input, null)
    );

    const enabledStageProgress = stageViews
      .filter((stage) => stage.enabled)
      .map((stage) => stage.progress_percent);
    const progress_percent = averageProgress(enabledStageProgress);
    const hasBlocked = stageViews.some(
      (stage) => stage.enabled && stage.status === "blocked"
    );

    return {
      id: group.id,
      key: group.key,
      name: group.name,
      sort_order: group.sort_order,
      estimated_hours: group.estimated_hours,
      enabled: group.enabled,
      scope: group.scope,
      room_ids: group.room_ids,
      status: aggregateStatus(progress_percent, hasBlocked),
      progress_percent,
      stages: stageViews,
      is_current: false,
      is_expanded: false,
    };
  });

  const current = resolveCurrentContext(preliminaryGroups);
  const currentStageId = current?.stage_id ?? null;
  const currentInstanceId = current?.instance_id ?? null;

  const groups: WorkflowGroupView[] = normalizedDefinition.groups.map((group, index) => {
    const preliminary = preliminaryGroups[index];
    const stageViews = group.stages.map((stage) =>
      buildStageView(stage, group, input, currentInstanceId)
    );

    return {
      ...preliminary,
      stages: stageViews.map((stage) => ({
        ...stage,
        is_current: stage.id === currentStageId,
      })),
      is_current: current?.group_id === group.id,
      is_expanded: current?.group_id === group.id,
    };
  });

  const enabledGroupProgress = groups
    .filter((group) => group.enabled)
    .map((group) => group.progress_percent);

  return {
    project_id: input.project_id,
    progress_percent: averageProgress(enabledGroupProgress),
    groups,
    current,
  };
}

export function mapLegacyPhases(
  rooms: Array<{
    id: string;
    name: string;
    phases: Array<{ id: string; phase_kind: import("@/features/phases/types/phase").PhaseKind; status: LegacyPhaseSnapshot["status"] }>;
  }>
): LegacyPhaseSnapshot[] {
  return rooms.flatMap((room) =>
    room.phases.map((phase) => ({
      id: phase.id,
      room_id: room.id,
      phase_kind: phase.phase_kind,
      status: phase.status,
    }))
  );
}
