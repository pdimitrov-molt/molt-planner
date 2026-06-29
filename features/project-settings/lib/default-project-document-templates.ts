import { randomUUID } from "node:crypto";

import type { WorkflowDocumentItemDefinition } from "@/features/workflow-engine/types/workflow-engine";
import { bg } from "@/src/i18n/bg";

export const PROJECT_DOCUMENT_TEMPLATE_KEYS = [
  "furniture_drawings",
  "architectural_drawings",
  "schedules",
  "specifications",
] as const;

export type ProjectDocumentTemplateKey = (typeof PROJECT_DOCUMENT_TEMPLATE_KEYS)[number];

const TEMPLATE_LABELS: Record<ProjectDocumentTemplateKey, string> = {
  furniture_drawings: bg.projects.settings.documents.templates.furnitureDrawings,
  architectural_drawings: bg.projects.settings.documents.templates.architecturalDrawings,
  schedules: bg.projects.settings.documents.templates.schedules,
  specifications: bg.projects.settings.documents.templates.specifications,
};

export function buildDefaultProjectDocumentTemplates(): WorkflowDocumentItemDefinition[] {
  return PROJECT_DOCUMENT_TEMPLATE_KEYS.map((key, index) => ({
    id: randomUUID(),
    key,
    name: TEMPLATE_LABELS[key],
    sort_order: index,
    enabled: true,
  }));
}
