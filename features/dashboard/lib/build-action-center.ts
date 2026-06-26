import type { ProjectWithClient } from "@/features/projects/types/project";
import type { ProjectWorkspace } from "@/features/projects/types/project-workspace";
import { adaptActionCenterView } from "@/features/studio-workflow/lib/adapt-action-center-view";
import type { ContinueWorkingResult } from "@/features/work-sessions/types/continue-working";
import type { WorkSession } from "@/features/work-sessions/types/work-session";
import type {
  WorkflowActionDisplay,
  WorkspaceItem,
} from "@/features/studio-workflow/types/workspace-item";

export type ActionCenterActionKind =
  | "running_work"
  | "current_phase"
  | "no_started_work"
  | "overdue_phase";

export interface ActionCenterAction {
  id: string;
  kind: ActionCenterActionKind;
  priority: number;
  project_id: string;
  project_name: string;
  room_id: string;
  room_name: string;
  phase_id: string;
  phase_label: string;
  recommended_action: string;
  cta_label: string;
  cta_href: string;
  workspace_item: WorkspaceItem;
  display: WorkflowActionDisplay;
}

export interface ActionCenterWaitingItem {
  id: string;
  kind: "blocked" | "paused";
  project_id: string;
  project_name: string;
  room_name: string;
  phase_label: string;
  title: string;
  context: string;
  href: string;
  workspace_item?: WorkspaceItem;
}

export interface ActionCenterDeadline {
  id: string;
  project_id: string;
  project_name: string;
  label: string;
  date_label: string;
  date_iso: string;
  is_overdue: boolean;
  href: string;
  workspace_item?: WorkspaceItem;
}

export interface ActionCenterView {
  continueWorking: ContinueWorkingResult;
  continueWorkingDisplay: WorkflowActionDisplay | null;
  nextActions: ActionCenterAction[];
  waitingItems: ActionCenterWaitingItem[];
  deadlines: ActionCenterDeadline[];
}

export interface PausedWorkSessionItem {
  session_id: string;
  project_id: string;
  project_name: string;
  room_id: string;
  room_name: string;
  phase_id: string;
  phase_label: string;
}

interface BuildActionCenterInput {
  workspaces: ProjectWorkspace[];
  projects: ProjectWithClient[];
  continueWorking: ContinueWorkingResult;
  runningSession: WorkSession | null;
  pausedSessions: PausedWorkSessionItem[];
  referenceDate?: Date;
}

export function buildActionCenter(input: BuildActionCenterInput): ActionCenterView {
  return adaptActionCenterView(input);
}
