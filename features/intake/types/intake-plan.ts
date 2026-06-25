import type { ProjectType } from "@/features/projects/types/project";

export type IntakeScopeMode = "manual" | "template";

export type ScheduleFitStatus = "green" | "yellow" | "red";

export interface IntakeScopeInput {
  mode: IntakeScopeMode;
  site_area: number | null;
  approximate_room_count: number;
  selected_template_room_keys: string[];
}

export interface IntakeSimulationInput {
  project_type: ProjectType;
  scope: IntakeScopeInput;
}

export interface IntakeEstimate {
  room_count: number;
  estimated_hours: number;
  estimated_duration_weeks: number;
  earliest_available_start: string;
  earliest_available_start_label: string;
  estimated_completion_date: string;
  estimated_completion_label: string;
}

export interface ScheduleFitAssessment {
  status: ScheduleFitStatus;
  headline: string;
  detail: string;
  current_remaining_hours: number;
  combined_remaining_hours: number;
  combined_pipeline_weeks: number;
  parallel_delay_weeks: number;
  studio_backlog_weeks_before: number;
  studio_backlog_weeks_after: number;
}

export interface IntakeSimulationResult {
  project_type: ProjectType;
  project_type_label: string;
  scope_summary: string;
  estimate: IntakeEstimate;
  schedule_fit: ScheduleFitAssessment;
}

export interface IntakeStudioContext {
  remaining_hours: number;
  weekly_capacity_hours: number;
  earliest_next_project_start: string;
  earliest_next_project_start_label: string;
  active_project_count: number;
}
