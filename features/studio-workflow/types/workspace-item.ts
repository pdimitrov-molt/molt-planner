import type { PhaseStatus } from "@/features/phases/types/phase";
import type { ProjectWorkKind } from "@/features/studio-workflow/types/project-work-kind";

export type WorkflowItemStatus = PhaseStatus;

export interface ProjectWorkspaceItem {
  scope: "project";
  id: string;
  project_id: string;
  project_name: string;
  kind: ProjectWorkKind;
  label: string;
  status: WorkflowItemStatus;
  target_end_date: string | null;
}

export interface RoomWorkspaceItem {
  scope: "room";
  id: string;
  project_id: string;
  project_name: string;
  room_id: string;
  room_name: string;
  phase_id: string;
  label: string;
  status: WorkflowItemStatus;
  target_end_date: string | null;
  is_current: boolean;
}

export type WorkspaceItem = ProjectWorkspaceItem | RoomWorkspaceItem;

export type WorkflowActionKind = "current" | "not_started" | "overdue";

export interface WorkflowAction {
  id: string;
  item: WorkspaceItem;
  kind: WorkflowActionKind;
  priority: number;
  recommended_action: string;
  cta_label: string;
  cta_href: string;
}

export interface WorkflowActionDisplay {
  title: string;
  subtitle: string;
  scope: WorkspaceItem["scope"];
}
