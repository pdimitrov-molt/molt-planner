import type { PhaseStatus } from "@/features/phases/types/phase";
import type { EngagementStatus } from "@/features/projects/types/project";

export interface PhaseProgressSnapshot {
  status: PhaseStatus;
  completed_at: string | null;
}

export interface RoomProgressSnapshot {
  id: string;
  phases: PhaseProgressSnapshot[];
}

export interface ProjectProgressSnapshot {
  id: string;
  engagement_status: EngagementStatus;
  rooms: RoomProgressSnapshot[];
}

export interface RoomProgress {
  completed_phases: number;
  total_phases: number;
  progress_percent: number;
  is_completed: boolean;
}

export interface ProjectProgress {
  completed_rooms: number;
  total_rooms: number;
  completed_phases: number;
  total_phases: number;
  progress_percent: number;
  is_completed: boolean;
}

export interface StudioProgressSummary {
  overall_progress_percent: number;
  completed_phases: number;
  total_phases: number;
  projects_in_progress: number;
  rooms_completed_today: number;
  hours_worked_today_label: string;
}
