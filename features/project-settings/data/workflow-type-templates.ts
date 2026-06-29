import { randomUUID } from "node:crypto";

import type { PhaseKind } from "@/features/phases/types/phase";
import { PHASE_KIND_LABELS } from "@/features/phases/types/phase";
import { getPhaseTemplateEstimatedHours } from "@/features/phases/data/phase-templates";
import type { ProjectWorkflowStage } from "@/features/project-settings/types/project-workflow-stage";
import type { WorkflowType } from "@/features/project-settings/types/workflow-type";
import { bg } from "@/src/i18n/bg";

interface WorkflowStageTemplate {
  key: string;
  label: string;
  phase_kind: PhaseKind | null;
  estimated_hours?: number;
}

const PHASE = (kind: PhaseKind): WorkflowStageTemplate => ({
  key: kind,
  label: PHASE_KIND_LABELS[kind],
  phase_kind: kind,
  estimated_hours: getPhaseTemplateEstimatedHours(kind),
});

const CUSTOM = (
  key: string,
  label: string,
  hours: number
): WorkflowStageTemplate => ({
  key,
  label,
  phase_kind: null,
  estimated_hours: hours,
});

export const WORKFLOW_TYPE_STAGE_TEMPLATES: Record<
  WorkflowType,
  WorkflowStageTemplate[]
> = {
  interior_design: [
    PHASE("discovery"),
    PHASE("concept"),
    PHASE("design_development"),
    PHASE("documentation"),
  ],
  interior_design_execution: [
    PHASE("discovery"),
    PHASE("concept"),
    PHASE("design_development"),
    PHASE("documentation"),
    PHASE("procurement"),
    PHASE("installation"),
    PHASE("styling"),
  ],
  execution_only: [
    PHASE("documentation"),
    PHASE("procurement"),
    PHASE("installation"),
    PHASE("styling"),
  ],
  exterior_design: [
    PHASE("discovery"),
    PHASE("concept"),
    PHASE("design_development"),
    PHASE("documentation"),
  ],
  exterior_execution: [
    PHASE("discovery"),
    PHASE("concept"),
    PHASE("design_development"),
    PHASE("documentation"),
    PHASE("procurement"),
    PHASE("installation"),
  ],
  consultation: [
    CUSTOM("consultation_brief", bg.projects.settings.customStages.consultationBrief, 4),
    CUSTOM("consultation_review", bg.projects.settings.customStages.consultationReview, 6),
    CUSTOM("consultation_report", bg.projects.settings.customStages.consultationReport, 4),
  ],
  author_supervision: [
    PHASE("documentation"),
    PHASE("procurement"),
    PHASE("installation"),
    CUSTOM(
      "author_site_visits",
      bg.projects.settings.customStages.authorSiteVisits,
      16
    ),
  ],
};

export function buildDefaultWorkflowStages(
  workflowType: WorkflowType
): ProjectWorkflowStage[] {
  return WORKFLOW_TYPE_STAGE_TEMPLATES[workflowType].map((template, index) => ({
    id: randomUUID(),
    key: template.key,
    label: template.label,
    enabled: true,
    estimated_hours:
      template.estimated_hours ??
      (template.phase_kind
        ? getPhaseTemplateEstimatedHours(template.phase_kind)
        : 8),
    sort_order: index,
    phase_kind: template.phase_kind,
  }));
}

export function estimateHoursByScope(stages: ProjectWorkflowStage[]): {
  design: number;
  execution: number;
} {
  const designKinds: PhaseKind[] = [
    "discovery",
    "concept",
    "design_development",
    "documentation",
  ];
  const executionKinds: PhaseKind[] = ["procurement", "installation", "styling"];

  let design = 0;
  let execution = 0;

  for (const stage of stages) {
    if (!stage.enabled) {
      continue;
    }

    if (stage.phase_kind && designKinds.includes(stage.phase_kind)) {
      design += stage.estimated_hours;
      continue;
    }

    if (stage.phase_kind && executionKinds.includes(stage.phase_kind)) {
      execution += stage.estimated_hours;
      continue;
    }

    design += stage.estimated_hours;
  }

  return { design, execution };
}
