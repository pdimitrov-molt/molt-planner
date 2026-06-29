import { randomUUID } from "node:crypto";

import type { WorkflowDocumentItemDefinition } from "@/features/workflow-engine/types/workflow-engine";
import { bg } from "@/src/i18n/bg";

export const DEFAULT_DOCUMENT_ITEM_KEYS = [
  "architectural_drawings",
  "furniture_drawings",
  "details",
] as const;

export type DefaultDocumentItemKey = (typeof DEFAULT_DOCUMENT_ITEM_KEYS)[number];

const DOCUMENT_ITEM_LABELS: Record<DefaultDocumentItemKey, string> = {
  architectural_drawings: bg.workflowEngine.documentItems.architecturalDrawings,
  furniture_drawings: bg.workflowEngine.documentItems.furnitureDrawings,
  details: bg.workflowEngine.documentItems.details,
};

export function buildDefaultDocumentItems(): WorkflowDocumentItemDefinition[] {
  return DEFAULT_DOCUMENT_ITEM_KEYS.map((key, index) => ({
    id: randomUUID(),
    key,
    name: DOCUMENT_ITEM_LABELS[key],
    sort_order: index,
    enabled: true,
  }));
}

export function resolveDocumentItemsForStage(
  documentItems: WorkflowDocumentItemDefinition[] | undefined
): WorkflowDocumentItemDefinition[] {
  const items = documentItems?.length ? documentItems : buildDefaultDocumentItems();

  return items
    .filter((item) => item.enabled)
    .sort((left, right) => left.sort_order - right.sort_order);
}
