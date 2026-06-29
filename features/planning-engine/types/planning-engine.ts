import type { PhaseStatus } from "@/features/phases/types/phase";
import type { ProjectPriority } from "@/features/projects/types/project";
import type { WorkflowStageExecutionMode } from "@/features/workflow-engine/types/workflow-engine";

export type DashboardPriorityTier =
  | "current_project_stage"
  | "project_stages_waiting"
  | "room_tasks"
  | "document_tasks"
  | "paused"
  | "blocked"
  | "deadlines";

export const DASHBOARD_PRIORITY_TIER_ORDER: DashboardPriorityTier[] = [
  "current_project_stage",
  "project_stages_waiting",
  "room_tasks",
  "document_tasks",
  "paused",
  "blocked",
  "deadlines",
];

export interface StagePlanningMetrics {
  remaining_hours: number;
  estimated_finish_date: string;
  slack_days: number | null;
}

export interface PlanningWorkCandidate {
  id: string;
  tier: DashboardPriorityTier;
  project_id: string;
  project_name: string;
  project_number: string;
  project_priority: ProjectPriority;
  design_deadline: string | null;
  group_id: string;
  group_name: string;
  stage_id: string;
  stage_name: string;
  execution_mode: WorkflowStageExecutionMode;
  instance_id: string | null;
  instance_name: string | null;
  room_id: string | null;
  room_name: string | null;
  phase_id: string | null;
  status: PhaseStatus;
  remaining_hours: number;
  estimated_finish_date: string;
  slack_days: number | null;
  priority_score: number;
  is_active_timer: boolean;
  is_current_stage: boolean;
  href: string;
}

export interface DashboardPausedItem {
  id: string;
  tier: "paused";
  project_id: string;
  project_name: string;
  group_name: string;
  stage_name: string;
  instance_name: string | null;
  phase_id: string;
  session_id: string;
  href: string;
}

export interface DashboardBlockedItem {
  id: string;
  tier: "blocked";
  project_id: string;
  project_name: string;
  group_name: string;
  stage_name: string;
  execution_mode: WorkflowStageExecutionMode;
  instance_name: string | null;
  phase_id: string | null;
  href: string;
}

export interface DashboardDeadlineItem {
  id: string;
  tier: "deadlines";
  project_id: string;
  project_name: string;
  label: string;
  date_label: string;
  date_iso: string;
  is_overdue: boolean;
  href: string;
}

export type DashboardPriorityItem =
  | PlanningWorkCandidate
  | DashboardPausedItem
  | DashboardBlockedItem
  | DashboardDeadlineItem;

export interface DashboardPrioritySection {
  tier: DashboardPriorityTier;
  items: DashboardPriorityItem[];
}

export interface DashboardPrioritiesView {
  sections: DashboardPrioritySection[];
  reference_date: string;
}

export interface DailyPrioritiesView {
  items: PlanningWorkCandidate[];
  reference_date: string;
}
