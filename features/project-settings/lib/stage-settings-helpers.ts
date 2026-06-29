import { createId } from "@/lib/create-id";
import type {
  WorkflowDocumentItemDefinition,
  WorkflowStageDefinition,
  WorkflowStageExecutionMode,
} from "@/features/workflow-engine/types/workflow-engine";
import { itemTypeFromExecutionMode } from "@/features/workflow-engine/lib/workflow-execution-mode";

export function slugifyDocumentItemKey(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04FF]+/gi, "_")
    .replace(/^_+|_+$/g, "");

  return slug || "document_item";
}

export function createDocumentItem(input: {
  name: string;
  sort_order: number;
}): WorkflowDocumentItemDefinition {
  return {
    id: createId(),
    key: slugifyDocumentItemKey(input.name),
    name: input.name,
    sort_order: input.sort_order,
    enabled: true,
  };
}

export function applyStageExecutionModePatch(
  stage: WorkflowStageDefinition,
  execution_mode: WorkflowStageExecutionMode,
  defaultDocumentItemName: string
): Partial<WorkflowStageDefinition> {
  const patch: Partial<WorkflowStageDefinition> = {
    execution_mode,
    item_type: itemTypeFromExecutionMode(execution_mode),
    room_ids: execution_mode === "ROOMS" ? stage.room_ids : [],
  };

  if (
    execution_mode === "DOCUMENTS" &&
    (!stage.document_items || stage.document_items.length === 0)
  ) {
    patch.document_items = [
      createDocumentItem({
        name: defaultDocumentItemName,
        sort_order: 0,
      }),
    ];
  }

  return patch;
}

export function normalizeDocumentItems(
  items: WorkflowDocumentItemDefinition[]
): WorkflowDocumentItemDefinition[] {
  return items.map((item, index) => ({
    ...item,
    sort_order: index,
  }));
}
