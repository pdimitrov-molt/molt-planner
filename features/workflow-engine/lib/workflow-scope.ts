import type {
  WorkflowGroupDefinition,
  WorkflowGroupScope,
  WorkflowItemType,
  WorkflowStageDefinition,
} from "@/features/workflow-engine/types/workflow-engine";
import {
  itemTypeFromExecutionMode,
  normalizeExecutionMode,
} from "@/features/workflow-engine/lib/workflow-execution-mode";

export function normalizeItemType(
  stage: Pick<WorkflowStageDefinition, "item_type" | "execution_mode"> & {
    scope?: "project" | "room";
    room_required?: boolean;
  },
  groupScope?: WorkflowGroupScope
): WorkflowItemType {
  if (stage.item_type === "PROJECT_ITEM" || stage.item_type === "ROOM_ITEM") {
    return itemTypeFromExecutionMode(normalizeExecutionMode(stage, groupScope));
  }

  return itemTypeFromExecutionMode(normalizeExecutionMode(stage, groupScope));
}

export function normalizeGroupScope(
  group: Pick<WorkflowGroupDefinition, "scope"> & {
    stages?: Array<
      Pick<WorkflowStageDefinition, "item_type" | "execution_mode" | "scope" | "room_required">
    >;
  }
): WorkflowGroupScope {
  if (group.scope === "PROJECT" || group.scope === "ROOM") {
    return group.scope;
  }

  const hasRoomItem = group.stages?.some(
    (stage) => normalizeExecutionMode(stage) === "ROOMS"
  );

  return hasRoomItem ? "ROOM" : "PROJECT";
}

export function isProjectGroup(
  group: Pick<WorkflowGroupDefinition, "scope">
): boolean {
  return normalizeGroupScope(group) === "PROJECT";
}

export function isRoomGroup(
  group: Pick<WorkflowGroupDefinition, "scope">
): boolean {
  return normalizeGroupScope(group) === "ROOM";
}

export function isProjectItem(
  item: Pick<WorkflowStageDefinition, "item_type" | "execution_mode"> & {
    scope?: "project" | "room";
    room_required?: boolean;
  }
): boolean {
  return normalizeExecutionMode(item) !== "ROOMS";
}

export function isRoomItem(
  item: Pick<WorkflowStageDefinition, "item_type" | "execution_mode"> & {
    scope?: "project" | "room";
    room_required?: boolean;
  }
): boolean {
  return normalizeExecutionMode(item) === "ROOMS";
}

export function resolveGroupRoomIds(
  group: Pick<WorkflowGroupDefinition, "scope" | "room_ids">,
  rooms: Array<{ id: string }>
): string[] {
  if (!isRoomGroup(group)) {
    return [];
  }

  if (group.room_ids.length > 0) {
    return group.room_ids;
  }

  return rooms.map((room) => room.id);
}

export function normalizeGroupDefinition(
  group: WorkflowGroupDefinition & {
    stages: Array<WorkflowStageDefinition & { scope?: "project" | "room"; room_required?: boolean }>;
  }
): WorkflowGroupDefinition {
  const scope = normalizeGroupScope(group);

  return {
    ...group,
    scope,
    room_ids: scope === "ROOM" ? group.room_ids : [],
    stages: group.stages.map((stage) => normalizeStageDefinition(stage, scope)),
  };
}

export function normalizeStageDefinition(
  stage: WorkflowStageDefinition & {
    scope?: "project" | "room";
    room_required?: boolean;
  },
  groupScope: WorkflowGroupScope
): WorkflowStageDefinition {
  const execution_mode = normalizeExecutionMode(stage, groupScope);
  const item_type = itemTypeFromExecutionMode(execution_mode);

  return {
    ...stage,
    execution_mode,
    item_type,
    room_ids: item_type === "ROOM_ITEM" ? stage.room_ids : [],
    document_items: stage.document_items,
  };
}

export function canExpandRooms(group: Pick<WorkflowGroupDefinition, "scope">): boolean {
  return isRoomGroup(group);
}
