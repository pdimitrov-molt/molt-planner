import type { PhaseStatus } from "@/features/phases/types/phase";
import type { EngagementStatus } from "@/features/projects/types/project";
import type { DashboardPriorityTier } from "@/features/planning-engine/types/planning-engine";
import type { WorkflowStageExecutionMode } from "@/features/workflow-engine/types/workflow-engine";

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

export interface StudioWorkflowGroupRow {
  id: string;
  name: string;
  progress_percent: number;
  status_label: string;
  current_stage_label: string | null;
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
  workflow_groups: StudioWorkflowGroupRow[];
  current_group_name: string | null;
  current_stage_name: string | null;
  current_room_name: string | null;
  href: string;
}

export interface StudioSummaryCard {
  id: "active" | "in_progress" | "waiting" | "overdue";
  value: number;
  total?: number;
  accent: "green" | "blue" | "orange" | "red";
}

export interface StudioContinueWorkingView {
  project_name: string;
  group_name: string;
  stage_name: string;
  room_name: string | null;
  href: string;
  session_id: string;
  started_at: string;
}

export interface StudioTodayWorkItem {
  id: string;
  rank: number;
  tier: DashboardPriorityTier;
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
  estimated_finish_date: string;
  slack_days: number | null;
  priority_score: number;
  is_active_timer: boolean;
  href: string;
}

export interface StudioDashboardPausedItem {
  id: string;
  project_id: string;
  project_name: string;
  group_name: string;
  stage_name: string;
  instance_name: string | null;
  href: string;
}

export interface StudioDashboardBlockedItem {
  id: string;
  project_id: string;
  project_name: string;
  group_name: string;
  stage_name: string;
  instance_name: string | null;
  href: string;
}

export interface StudioDashboardDeadlineItem {
  id: string;
  project_id: string;
  project_name: string;
  label: string;
  date_label: string;
  is_overdue: boolean;
  href: string;
}

export interface StudioDashboardPrioritySection {
  tier: DashboardPriorityTier;
  title: string;
  subtitle: string;
  workItems: StudioTodayWorkItem[];
  pausedItems: StudioDashboardPausedItem[];
  blockedItems: StudioDashboardBlockedItem[];
  deadlineItems: StudioDashboardDeadlineItem[];
}

export interface StudioDashboardView {
  summary: StudioSummaryCard[];
  prioritySections: StudioDashboardPrioritySection[];
  projects: StudioProjectRow[];
  continueWorking: StudioContinueWorkingView | null;
}
