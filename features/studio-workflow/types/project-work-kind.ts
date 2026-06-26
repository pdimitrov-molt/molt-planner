import { bg } from "@/src/i18n/bg";

export const PROJECT_WORK_KINDS = [
  "inquiry",
  "offer",
  "contract",
  "site_survey",
  "measurements",
  "research",
  "moodboard",
  "budget_discussion",
  "client_presentation",
  "procurement_coordination",
  "final_handover",
] as const;

export type ProjectWorkKind = (typeof PROJECT_WORK_KINDS)[number];

export const PROJECT_WORK_KIND_LABELS: Record<ProjectWorkKind, string> =
  bg.studioWorkflow.projectWorkKind;

export function isProjectWorkKind(value: string): value is ProjectWorkKind {
  return PROJECT_WORK_KINDS.includes(value as ProjectWorkKind);
}
