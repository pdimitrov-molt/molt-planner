import type { PhaseStatus } from "@/features/phases/types/phase";
import type { EngagementStatus, ProjectPriority } from "@/features/projects/types/project";
import type { WaitingCategory } from "@/features/projects/types/project-workspace";
import type { WorkflowStageExecutionMode } from "@/features/workflow-engine/types/workflow-engine";

export interface CommandCenterFocusItem {
  id: string;
  rank: number;
  project_id: string;
  project_name: string;
  project_number: string;
  group_name: string;
  stage_name: string;
  execution_mode: WorkflowStageExecutionMode;
  instance_name: string | null;
  room_name: string | null;
  status: PhaseStatus;
  status_label: string;
  remaining_hours: number;
  priority_score: number;
  is_active_timer: boolean;
  href: string;
}

export interface CommandCenterActiveProject {
  id: string;
  name: string;
  project_number: string;
  progress_percent: number;
  current_group_name: string | null;
  current_stage_name: string | null;
  remaining_hours: number;
  deadline_label: string;
  planner_score: number;
  href: string;
}

export type CommandCenterRiskStatus = "on_track" | "risk" | "overdue";

export interface CommandCenterAtRiskProject {
  id: string;
  name: string;
  project_number: string;
  forecast_finish_label: string;
  deadline_label: string;
  risk_status: CommandCenterRiskStatus;
  risk_status_label: string;
  slack_days: number | null;
  href: string;
}

export interface CommandCenterWaitingItem {
  id: string;
  project_id: string;
  project_name: string;
  stage_name: string;
  reason_label: string;
  days_waiting: number;
  days_waiting_label: string;
  started_at_label: string;
  expected_date_label: string | null;
  href: string;
}

export interface CommandCenterWaitingGroup {
  title: string;
  items: CommandCenterWaitingItem[];
}

export interface CommandCenterCapacity {
  this_week_hours: number;
  next_week_hours: number;
  total_remaining_hours: number;
}

export interface CommandCenterRecentSession {
  id: string;
  project_name: string;
  context_label: string;
  worked_duration_label: string;
  time_label: string;
  href: string;
}

export interface CommandCenterRecentCompletedStage {
  id: string;
  project_name: string;
  group_name: string;
  stage_name: string;
  instance_name: string | null;
  completed_at_label: string;
  href: string;
}

export interface CommandCenterRecentCompletedProject {
  id: string;
  name: string;
  project_number: string;
  completed_at_label: string;
  href: string;
}

export interface CommandCenterRecentActivity {
  sessions: CommandCenterRecentSession[];
  completed_stages: CommandCenterRecentCompletedStage[];
  completed_projects: CommandCenterRecentCompletedProject[];
}

export interface CommandCenterContinueWorking {
  project_name: string;
  group_name: string;
  stage_name: string;
  room_name: string | null;
  href: string;
  session_id: string;
  started_at: string;
}

export interface CommandCenterView {
  continue_working: CommandCenterContinueWorking | null;
  todays_focus: CommandCenterFocusItem[];
  active_projects: CommandCenterActiveProject[];
  at_risk_projects: CommandCenterAtRiskProject[];
  waiting_groups: CommandCenterWaitingGroup[];
  capacity: CommandCenterCapacity;
  recent_activity: CommandCenterRecentActivity;
}

export interface CommandCenterCriticalView {
  continue_working: CommandCenterContinueWorking | null;
  todays_focus: CommandCenterFocusItem[];
  waiting_groups: CommandCenterWaitingGroup[];
  at_risk_projects: CommandCenterAtRiskProject[];
}

export interface CommandCenterBackgroundView {
  active_projects: CommandCenterActiveProject[];
  capacity: CommandCenterCapacity;
}

export interface CommandCenterProjectMeta {
  id: string;
  name: string;
  project_number: string;
  engagement_status: EngagementStatus;
  priority: ProjectPriority;
  design_deadline: string | null;
  updated_at: string;
}

export type CommandCenterWaitingCategory = WaitingCategory;
