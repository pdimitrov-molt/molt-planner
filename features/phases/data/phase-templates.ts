import type { PhaseKind } from "@/features/phases/types/phase";

export interface PhaseTemplate {
  phase_kind: PhaseKind;
  default_estimated_hours: number;
  description: string;
}

export const PHASE_TEMPLATES: PhaseTemplate[] = [
  {
    phase_kind: "discovery",
    default_estimated_hours: 8,
    description: "Brief, measurements, and site constraints",
  },
  {
    phase_kind: "concept",
    default_estimated_hours: 16,
    description: "Mood direction, layout, and material intent",
  },
  {
    phase_kind: "design_development",
    default_estimated_hours: 24,
    description: "Drawings, selections, and design revisions",
  },
  {
    phase_kind: "documentation",
    default_estimated_hours: 12,
    description: "Specifications, schedules, and contractor packs",
  },
  {
    phase_kind: "procurement",
    default_estimated_hours: 10,
    description: "Ordering, lead times, and vendor coordination",
  },
  {
    phase_kind: "installation",
    default_estimated_hours: 8,
    description: "Site coordination and snagging",
  },
  {
    phase_kind: "styling",
    default_estimated_hours: 6,
    description: "Final layer, photography, and handover",
  },
];

export const PHASE_TEMPLATE_HOURS: Record<PhaseKind, number> = PHASE_TEMPLATES.reduce(
  (accumulator, template) => {
    accumulator[template.phase_kind] = template.default_estimated_hours;
    return accumulator;
  },
  {} as Record<PhaseKind, number>
);

export function getPhaseTemplateEstimatedHours(phaseKind: PhaseKind): number {
  return PHASE_TEMPLATE_HOURS[phaseKind];
}

export function getPhaseTemplate(phaseKind: PhaseKind): PhaseTemplate {
  const template = PHASE_TEMPLATES.find((entry) => entry.phase_kind === phaseKind);

  if (!template) {
    throw new Error(`Missing phase template for ${phaseKind}.`);
  }

  return template;
}
