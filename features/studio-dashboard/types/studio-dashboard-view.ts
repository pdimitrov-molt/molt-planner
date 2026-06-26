import type { EngagementStatus } from "@/features/projects/types/project";

export type StudioTimelineStepState =
  | "completed"
  | "current"
  | "waiting"
  | "overdue"
  | "future";

export type StudioProjectStatus =
  | "in_progress"
  | "waiting"
  | "overdue"
  | "completed"
  | "active"
  | "paused"
  | "inquiry";

export interface StudioTimelineStep {
  id: string;
  label: string;
  state: StudioTimelineStepState;
}

export interface StudioRoomRow {
  id: string;
  name: string;
  current_phase_label: string;
  current_task_label: string;
  status_label: string;
  status: "not_started" | "in_progress" | "blocked" | "completed";
  remaining_hours_label: string;
  progress_percent: number;
  href: string;
}

export interface StudioProjectRow {
  id: string;
  name: string;
  project_number: string;
  object_type_label: string;
  area_label: string;
  engagement_status: EngagementStatus;
  status: StudioProjectStatus;
  status_label: string;
  progress_percent: number;
  timeline: StudioTimelineStep[];
  rooms: StudioRoomRow[];
  href: string;
}

export interface StudioSummaryCard {
  id: "active" | "in_progress" | "waiting" | "overdue";
  value: number;
  total?: number;
  accent: "green" | "blue" | "orange" | "red";
}

export interface StudioDashboardView {
  summary: StudioSummaryCard[];
  projects: StudioProjectRow[];
}
