import { randomUUID } from "node:crypto";

import type { PhaseKind } from "@/features/phases/types/phase";
import type { ProjectPackage } from "@/features/projects/types/project";
import type {
  HierarchicalWorkflowDefinition,
  WorkflowDocumentItemDefinition,
  WorkflowGroupDefinition,
  WorkflowGroupScope,
  WorkflowStageDefinition,
  WorkflowStageExecutionMode,
} from "@/features/workflow-engine/types/workflow-engine";
import { itemTypeFromExecutionMode } from "@/features/workflow-engine/lib/workflow-execution-mode";

interface StageTemplate {
  key: string;
  name: string;
  estimated_hours: number;
  execution_mode: WorkflowStageExecutionMode;
  legacy_phase_kind: PhaseKind | null;
  document_items?: WorkflowDocumentItemDefinition[];
}

interface GroupTemplate {
  key: string;
  name: string;
  scope: WorkflowGroupScope;
  package_gate?: "execution" | "supervision";
  stages: StageTemplate[];
}

function documentItems(
  items: Array<{ key: string; name: string }>
): WorkflowDocumentItemDefinition[] {
  return items.map((item, index) => ({
    id: randomUUID(),
    key: item.key,
    name: item.name,
    sort_order: index,
    enabled: true,
  }));
}

function singleDocumentItem(key: string, name: string): WorkflowDocumentItemDefinition[] {
  return documentItems([{ key, name }]);
}

const INTERIOR_DESIGN_WORKFLOW_TEMPLATE: GroupTemplate[] = [
  {
    key: "conceptual_design",
    name: "Концептуален дизайн",
    scope: "PROJECT",
    stages: [
      {
        key: "object_inspection",
        name: "Оглед на обекта",
        estimated_hours: 8,
        execution_mode: "PROJECT",
        legacy_phase_kind: "discovery",
      },
      {
        key: "photography",
        name: "Заснемане",
        estimated_hours: 6,
        execution_mode: "PROJECT",
        legacy_phase_kind: "discovery",
      },
      {
        key: "base_layout_drawing",
        name: "Изчертаване на подложка",
        estimated_hours: 8,
        execution_mode: "PROJECT",
        legacy_phase_kind: "discovery",
      },
      {
        key: "functional_layout",
        name: "Функционално разпределение",
        estimated_hours: 16,
        execution_mode: "PROJECT",
        legacy_phase_kind: "concept",
      },
      {
        key: "design_concept",
        name: "Дизайн концепция",
        estimated_hours: 12,
        execution_mode: "PROJECT",
        legacy_phase_kind: "concept",
      },
      {
        key: "presentation",
        name: "Презентация",
        estimated_hours: 4,
        execution_mode: "PROJECT",
        legacy_phase_kind: "concept",
      },
      {
        key: "approval_conceptual",
        name: "Одобрение",
        estimated_hours: 2,
        execution_mode: "PROJECT",
        legacy_phase_kind: "concept",
      },
    ],
  },
  {
    key: "schematic_design",
    name: "Идеен проект",
    scope: "ROOM",
    stages: [
      {
        key: "visualizations_3d",
        name: "3D визуализации",
        estimated_hours: 24,
        execution_mode: "ROOMS",
        legacy_phase_kind: "design_development",
      },
      {
        key: "schematic_presentation",
        name: "Представяне",
        estimated_hours: 4,
        execution_mode: "PROJECT",
        legacy_phase_kind: "design_development",
      },
      {
        key: "corrections",
        name: "Корекции",
        estimated_hours: 12,
        execution_mode: "ROOMS",
        legacy_phase_kind: "design_development",
      },
      {
        key: "final_presentation",
        name: "Финално представяне",
        estimated_hours: 4,
        execution_mode: "PROJECT",
        legacy_phase_kind: "design_development",
      },
      {
        key: "approval_schematic",
        name: "Одобрение",
        estimated_hours: 2,
        execution_mode: "PROJECT",
        legacy_phase_kind: "design_development",
      },
    ],
  },
  {
    key: "working_project",
    name: "Работен проект",
    scope: "PROJECT",
    stages: [
      {
        key: "architectural_drawings",
        name: "Архитектурни чертежи",
        estimated_hours: 24,
        execution_mode: "DOCUMENTS",
        legacy_phase_kind: "documentation",
        document_items: documentItems([
          { key: "layout", name: "Разпределение" },
          { key: "flooring", name: "Настилки" },
          { key: "ceilings", name: "Тавани" },
          { key: "walls", name: "Стени" },
          { key: "lighting", name: "Осветление" },
          { key: "electrical", name: "Електро" },
          { key: "plumbing", name: "ВиК" },
        ]),
      },
      {
        key: "furniture_drawings",
        name: "Мебелни чертежи",
        estimated_hours: 20,
        execution_mode: "DOCUMENTS",
        legacy_phase_kind: "documentation",
        document_items: documentItems([
          { key: "kitchen", name: "Кухня" },
          { key: "wardrobes", name: "Гардероби" },
          { key: "bathroom", name: "Баня" },
          { key: "tv_unit", name: "TV модул" },
          { key: "other_furniture", name: "Други мебели" },
        ]),
      },
      {
        key: "details",
        name: "Детайли",
        estimated_hours: 12,
        execution_mode: "DOCUMENTS",
        legacy_phase_kind: "documentation",
        document_items: singleDocumentItem("details", "Детайли"),
      },
      {
        key: "quantity_estimates",
        name: "Количествени сметки",
        estimated_hours: 8,
        execution_mode: "PROJECT",
        legacy_phase_kind: "documentation",
      },
      {
        key: "approval_working",
        name: "Одобрение",
        estimated_hours: 2,
        execution_mode: "PROJECT",
        legacy_phase_kind: "documentation",
      },
    ],
  },
  {
    key: "documentation",
    name: "Документация",
    scope: "PROJECT",
    stages: [
      {
        key: "offers",
        name: "Оферти",
        estimated_hours: 6,
        execution_mode: "PROJECT",
        legacy_phase_kind: "documentation",
      },
      {
        key: "specifications",
        name: "Спецификации",
        estimated_hours: 10,
        execution_mode: "DOCUMENTS",
        legacy_phase_kind: "documentation",
        document_items: singleDocumentItem("specifications", "Спецификации"),
      },
      {
        key: "schedules",
        name: "Таблици",
        estimated_hours: 8,
        execution_mode: "DOCUMENTS",
        legacy_phase_kind: "documentation",
        document_items: singleDocumentItem("schedules", "Таблици"),
      },
      {
        key: "materials",
        name: "Материали",
        estimated_hours: 8,
        execution_mode: "DOCUMENTS",
        legacy_phase_kind: "documentation",
        document_items: singleDocumentItem("materials", "Материали"),
      },
      {
        key: "orders",
        name: "Поръчки",
        estimated_hours: 6,
        execution_mode: "DOCUMENTS",
        legacy_phase_kind: "procurement",
        document_items: singleDocumentItem("orders", "Поръчки"),
      },
      {
        key: "final_package",
        name: "Финален комплект",
        estimated_hours: 4,
        execution_mode: "PROJECT",
        legacy_phase_kind: "documentation",
      },
    ],
  },
  {
    key: "execution",
    name: "Изпълнение",
    scope: "PROJECT",
    package_gate: "execution",
    stages: [
      {
        key: "demolition",
        name: "Разрушаване",
        estimated_hours: 16,
        execution_mode: "PROJECT",
        legacy_phase_kind: "installation",
      },
      {
        key: "construction_works",
        name: "СМР",
        estimated_hours: 40,
        execution_mode: "PROJECT",
        legacy_phase_kind: "installation",
      },
      {
        key: "electrical_execution",
        name: "Електро",
        estimated_hours: 16,
        execution_mode: "PROJECT",
        legacy_phase_kind: "installation",
      },
      {
        key: "plumbing_execution",
        name: "ВиК",
        estimated_hours: 16,
        execution_mode: "PROJECT",
        legacy_phase_kind: "installation",
      },
      {
        key: "painting",
        name: "Боядисване",
        estimated_hours: 20,
        execution_mode: "PROJECT",
        legacy_phase_kind: "installation",
      },
      {
        key: "furniture_installation",
        name: "Монтаж мебели",
        estimated_hours: 24,
        execution_mode: "PROJECT",
        legacy_phase_kind: "installation",
      },
      {
        key: "lighting_installation",
        name: "Осветление",
        estimated_hours: 12,
        execution_mode: "PROJECT",
        legacy_phase_kind: "installation",
      },
      {
        key: "handover",
        name: "Предаване",
        estimated_hours: 4,
        execution_mode: "PROJECT",
        legacy_phase_kind: "styling",
      },
    ],
  },
  {
    key: "author_supervision",
    name: "Авторски надзор",
    scope: "PROJECT",
    package_gate: "supervision",
    stages: [
      {
        key: "supervision_visits",
        name: "Посещения",
        estimated_hours: 16,
        execution_mode: "PROJECT",
        legacy_phase_kind: "installation",
      },
      {
        key: "supervision_meetings",
        name: "Срещи",
        estimated_hours: 8,
        execution_mode: "PROJECT",
        legacy_phase_kind: "installation",
      },
      {
        key: "supervision_corrections",
        name: "Корекции",
        estimated_hours: 12,
        execution_mode: "PROJECT",
        legacy_phase_kind: "installation",
      },
      {
        key: "supervision_control",
        name: "Контрол",
        estimated_hours: 12,
        execution_mode: "PROJECT",
        legacy_phase_kind: "installation",
      },
      {
        key: "supervision_acceptance",
        name: "Приемане",
        estimated_hours: 4,
        execution_mode: "PROJECT",
        legacy_phase_kind: "styling",
      },
    ],
  },
];

export const APPROVED_INTERIOR_GROUP_KEYS = INTERIOR_DESIGN_WORKFLOW_TEMPLATE.map(
  (group) => group.key
);

export const OBSOLETE_WORKFLOW_GROUP_KEYS = [
  "concept_design",
  "design_development",
  "technical_documentation",
  "documentation_package",
] as const;

export const OBSOLETE_WORKFLOW_STAGE_KEYS = [
  "moodboard",
  "client_revision",
  "discovery",
  "space_planning",
  "presentation_review",
  "site_visit_measurements",
  "existing_drawings",
  "functional_layouts",
  "client_presentation",
  "modelling_3d",
  "lighting",
  "furniture",
  "electrical",
  "plumbing",
  "ceiling",
  "drawing_deliverables",
  "supplier_documentation",
  "final_delivery",
  "site_survey",
  "client_approval",
  "floor_plans",
  "quantity_survey",
] as const;

export function packageIncludesExecution(projectPackage: ProjectPackage): boolean {
  return projectPackage === "interior_exterior" || projectPackage === "complete_package";
}

export function packageIncludesSupervision(projectPackage: ProjectPackage): boolean {
  return projectPackage === "author_supervision" || projectPackage === "complete_package";
}

function groupIncludedForPackage(
  group: GroupTemplate,
  projectPackage: ProjectPackage
): boolean {
  if (group.package_gate === "execution") {
    return packageIncludesExecution(projectPackage);
  }

  if (group.package_gate === "supervision") {
    return packageIncludesSupervision(projectPackage);
  }

  return true;
}

function buildStage(template: StageTemplate, sortOrder: number): WorkflowStageDefinition {
  return {
    id: randomUUID(),
    key: template.key,
    name: template.name,
    sort_order: sortOrder,
    estimated_hours: template.estimated_hours,
    enabled: true,
    execution_mode: template.execution_mode,
    item_type: itemTypeFromExecutionMode(template.execution_mode),
    room_ids: [],
    document_items: template.document_items,
    legacy_phase_kind: template.legacy_phase_kind,
  };
}

function buildGroup(template: GroupTemplate, sortOrder: number): WorkflowGroupDefinition {
  const stages = template.stages.map((stage, index) => buildStage(stage, index));
  const estimated_hours = stages.reduce(
    (total, stage) => total + (stage.enabled ? stage.estimated_hours : 0),
    0
  );

  return {
    id: randomUUID(),
    key: template.key,
    name: template.name,
    sort_order: sortOrder,
    estimated_hours,
    enabled: true,
    scope: template.scope,
    room_ids: [],
    stages,
  };
}

export function buildDesignWorkflowForPackage(
  projectPackage: ProjectPackage
): HierarchicalWorkflowDefinition {
  const groups = INTERIOR_DESIGN_WORKFLOW_TEMPLATE.filter((group) =>
    groupIncludedForPackage(group, projectPackage)
  ).map((group, index) => buildGroup(group, index));

  return {
    version: 2,
    groups,
  };
}

export function buildDefaultDesignWorkflow(): HierarchicalWorkflowDefinition {
  return buildDesignWorkflowForPackage("complete_package");
}

export { INTERIOR_DESIGN_WORKFLOW_TEMPLATE as DESIGN_WORKFLOW_TEMPLATE };
