import type { PhaseKind, PhaseStatus } from "@/features/phases/types/phase";
import type { TaskKind, TaskStatus } from "@/features/tasks/types/task";
import type {
  EngagementStatus,
  ProjectPriority,
  ProjectType,
} from "@/features/projects/types/project";

export type WaitingCategory =
  | "client_approval"
  | "blocked_phase"
  | "supplier_waiting";

export interface WorkspaceTodayTask {
  id: string;
  title: string;
  room_name: string;
  phase_label: string;
  estimated_hours: number;
  status: TaskStatus;
  status_label: string;
}

export interface WorkspaceWaitingItem {
  id: string;
  category: WaitingCategory;
  title: string;
  context: string;
  room_name: string;
}

export interface WorkspaceRoomPhaseStep {
  id: string;
  label: string;
  status: PhaseStatus;
  is_current: boolean;
}

export interface WorkspaceRoomSummary {
  id: string;
  name: string;
  room_kind_label: string;
  current_phase_label: string;
  current_phase_status: PhaseStatus;
  is_focus: boolean;
  priority: string;
  phases: WorkspaceRoomPhaseStep[];
  remaining_hours: number;
}

export interface ProjectWorkspace {
  id: string;
  name: string;
  client_display_name: string;
  project_type_label: string;
  site_area_label: string;
  engagement_status: EngagementStatus;
  priority: ProjectPriority;
  target_handover_label: string;
  overall_completion_percent: number;
  critical_phase_label: string;
  critical_phase_context: string;
  capacity_hours_today: number;
  capacity_load_percent: number;
  capacity_impact_label: string;
  remaining_phase_hours: number;
  estimated_project_completion_label: string;
  focus_room_id: string | null;
  focus_room_name: string | null;
  rooms: WorkspaceRoomSummary[];
  today_tasks: WorkspaceTodayTask[];
  waiting_items: WorkspaceWaitingItem[];
}

export interface WorkspaceSourcePhase {
  id: string;
  room_id: string;
  phase_kind: PhaseKind;
  status: PhaseStatus;
  estimated_hours: number | null;
  blocker_reason: string | null;
  target_end_date: string | null;
  sort_order: number;
}

export interface WorkspaceSourceRoom {
  id: string;
  name: string;
  room_kind: string;
  priority: string;
  current_phase_id: string | null;
  sort_order: number;
  phases: WorkspaceSourcePhase[];
}

export interface WorkspaceSourceTask {
  id: string;
  room_id: string;
  phase_id: string;
  title: string;
  task_kind: TaskKind;
  status: TaskStatus;
  estimated_hours: number;
  scheduled_date: string | null;
  blocked_reason: string | null;
}

export interface WorkspaceSourceProject {
  id: string;
  name: string;
  client_display_name: string;
  project_type: ProjectType;
  site_area: number | null;
  engagement_status: EngagementStatus;
  priority: ProjectPriority;
  target_handover_date: string | null;
  rooms: WorkspaceSourceRoom[];
  tasks: WorkspaceSourceTask[];
}
