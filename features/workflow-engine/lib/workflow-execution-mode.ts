import type {
  WorkflowGroupScope,
  WorkflowItemType,
  WorkflowStageDefinition,
  WorkflowStageExecutionMode,
} from "@/features/workflow-engine/types/workflow-engine";

export function itemTypeFromExecutionMode(
  executionMode: WorkflowStageExecutionMode
): WorkflowItemType {
  return executionMode === "ROOMS" ? "ROOM_ITEM" : "PROJECT_ITEM";
}

export function executionModeFromItemType(
  itemType: WorkflowItemType
): WorkflowStageExecutionMode {
  return itemType === "ROOM_ITEM" ? "ROOMS" : "PROJECT";
}

export function executionModeForGroupScope(
  scope: WorkflowGroupScope
): WorkflowStageExecutionMode {
  return scope === "ROOM" ? "ROOMS" : "PROJECT";
}

export function normalizeExecutionMode(
  stage: Pick<WorkflowStageDefinition, "execution_mode" | "item_type"> & {
    scope?: "project" | "room";
    room_required?: boolean;
  },
  groupScope?: WorkflowGroupScope
): WorkflowStageExecutionMode {
  if (
    stage.execution_mode === "PROJECT" ||
    stage.execution_mode === "ROOMS" ||
    stage.execution_mode === "DOCUMENTS"
  ) {
    return stage.execution_mode;
  }

  if (stage.item_type === "ROOM_ITEM" || stage.scope === "room" || stage.room_required === true) {
    return "ROOMS";
  }

  if (stage.item_type === "PROJECT_ITEM" || stage.scope === "project") {
    return "PROJECT";
  }

  if (groupScope === "ROOM") {
    return "ROOMS";
  }

  return "PROJECT";
}

export function isProjectExecutionMode(
  executionMode: WorkflowStageExecutionMode
): boolean {
  return executionMode === "PROJECT" || executionMode === "DOCUMENTS";
}

export function isRoomsExecutionMode(
  executionMode: WorkflowStageExecutionMode
): boolean {
  return executionMode === "ROOMS";
}

export function isDocumentsExecutionMode(
  executionMode: WorkflowStageExecutionMode
): boolean {
  return executionMode === "DOCUMENTS";
}

export function instanceTypeFromExecutionMode(
  executionMode: WorkflowStageExecutionMode
): import("@/features/workflow-engine/types/workflow-engine").WorkflowStageInstanceType {
  switch (executionMode) {
    case "ROOMS":
      return "room";
    case "DOCUMENTS":
      return "document";
    default:
      return "project";
  }
}

export function minutesToEstimatedHours(minutes: number): number {
  return Math.round((minutes / 60) * 10) / 10;
}
