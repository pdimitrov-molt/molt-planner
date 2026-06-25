import { getPhaseTemplateEstimatedHours } from "@/features/phases/data/phase-templates";
import { bg } from "@/src/i18n/bg";

export const PHASE_KINDS = [
  "discovery",
  "concept",
  "design_development",
  "documentation",
  "procurement",
  "installation",
  "styling",
] as const;

export const PHASE_STATUSES = [
  "not_started",
  "in_progress",
  "blocked",
  "completed",
] as const;

export type PhaseKind = (typeof PHASE_KINDS)[number];
export type PhaseStatus = (typeof PHASE_STATUSES)[number];

export interface Phase {
  id: string;
  room_id: string;
  phase_kind: PhaseKind;
  status: PhaseStatus;
  target_start_date: string | null;
  target_end_date: string | null;
  completed_at: string | null;
  blocker_reason: string | null;
  estimated_hours: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PhaseRow {
  id: string;
  room_id: string;
  phase_kind: string;
  status: string;
  target_start_date: string | null;
  target_end_date: string | null;
  completed_at: string | null;
  blocker_reason: string | null;
  estimated_hours: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export const PHASE_KIND_LABELS: Record<PhaseKind, string> = bg.labels.phaseKind;

export const DEFAULT_PHASE_SEQUENCE: PhaseKind[] = [...PHASE_KINDS];

export function isPhaseKind(value: string): value is PhaseKind {
  return PHASE_KINDS.includes(value as PhaseKind);
}

export function isPhaseStatus(value: string): value is PhaseStatus {
  return PHASE_STATUSES.includes(value as PhaseStatus);
}

export function mapPhaseRow(row: PhaseRow): Phase {
  if (!isPhaseKind(row.phase_kind)) {
    throw new Error(`Invalid phase kind: ${row.phase_kind}`);
  }

  if (!isPhaseStatus(row.status)) {
    throw new Error(`Invalid phase status: ${row.status}`);
  }

  return {
    id: row.id,
    room_id: row.room_id,
    phase_kind: row.phase_kind,
    status: row.status,
    target_start_date: row.target_start_date,
    target_end_date: row.target_end_date,
    completed_at: row.completed_at,
    blocker_reason: row.blocker_reason,
    estimated_hours: Number(
      row.estimated_hours ?? getPhaseTemplateEstimatedHours(row.phase_kind)
    ),
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at ?? row.created_at,
    deleted_at: row.deleted_at,
  };
}
