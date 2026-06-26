import type { WorkSessionStatus } from "@/features/work-sessions/types/work-session";

export interface TodayWorkSessionEntry {
  id: string;
  project_id: string;
  project_name: string;
  room_id: string;
  room_name: string;
  phase_id: string;
  phase_label: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number;
  status: WorkSessionStatus;
  time_range_label: string;
  worked_duration_label: string;
}

export interface TodayWorkSummary {
  total_minutes: number;
  total_label: string;
  completed_count: number;
  running_count: number;
  completed_label: string;
  running_label: string;
}

export interface PhaseWorkSessionHistoryEntry {
  id: string;
  date_label: string;
  worked_duration_label: string;
  note: string | null;
  next_step: string | null;
  blocker: string | null;
}

export interface WorkSessionWithContextRow {
  id: string;
  project_id: string;
  room_id: string;
  phase_id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  status: string;
  note: string | null;
  next_step: string | null;
  blocker: string | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  projects?: { name: string } | { name: string }[] | null;
  rooms?: { name: string } | { name: string }[] | null;
  phases?: { phase_kind: string } | { phase_kind: string }[] | null;
}

export interface WorkSessionContextSnapshot {
  project_name: string;
  room_name: string;
  phase_kind: string;
}
