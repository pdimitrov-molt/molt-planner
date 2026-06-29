import type { PhaseKind, PhaseStatus } from "@/features/phases/types/phase";
import type { TaskStatus } from "@/features/tasks/types/task";
import type { PhaseWorkStats } from "@/features/work-sessions/lib/calculate-phase-work-stats";
import type { PhaseWorkSessionHistoryEntry } from "@/features/work-sessions/types/work-session-log";
import type { WorkSession } from "@/features/work-sessions/types/work-session";
import type { WorkflowWaitingEvent } from "@/features/workflow-engine/types/workflow-waiting-event";

export type WorkflowItemStatus = PhaseStatus;
export type WorkflowGroupScope = "PROJECT" | "ROOM";
export type WorkflowItemType = "PROJECT_ITEM" | "ROOM_ITEM";
export type WorkflowStageExecutionMode = "PROJECT" | "ROOMS" | "DOCUMENTS";

export const WORKFLOW_STAGE_EXECUTION_MODES = [
  "PROJECT",
  "ROOMS",
  "DOCUMENTS",
] as const satisfies readonly WorkflowStageExecutionMode[];

export type WorkflowStageInstanceType = "project" | "room" | "document";

export const WORKFLOW_STAGE_INSTANCE_TYPES = [
  "project",
  "room",
  "document",
] as const satisfies readonly WorkflowStageInstanceType[];

export interface WorkflowDocumentItemDefinition {
  id: string;
  key: string;
  name: string;
  sort_order: number;
  enabled: boolean;
}

export interface WorkflowStageInstance {
  id: string;
  project_id: string;
  group_key: string;
  stage_key: string;
  group_name: string;
  stage_name: string;
  execution_mode: WorkflowStageExecutionMode;
  instance_type: WorkflowStageInstanceType;
  room_id: string | null;
  document_key: string | null;
  assigned_user_id: string | null;
  status: WorkflowItemStatus;
  estimated_minutes: number;
  worked_minutes: number;
  progress_percent: number;
  started_at: string | null;
  completed_at: string | null;
  last_activity_at: string | null;
  sort_order: number;
  enabled: boolean;
  legacy_phase_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WorkflowStageInstanceRow {
  id: string;
  project_id: string;
  group_key: string;
  stage_key: string;
  group_name: string;
  stage_name: string;
  execution_mode: string;
  instance_type: string;
  room_id: string | null;
  document_key: string | null;
  assigned_user_id: string | null;
  status: string;
  estimated_minutes: number;
  worked_minutes: number;
  progress_percent: number;
  started_at: string | null;
  completed_at: string | null;
  last_activity_at: string | null;
  sort_order: number;
  enabled: boolean;
  legacy_phase_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** @deprecated Use WorkflowStageInstance */
export type LegacyWorkflowStageInstance = WorkflowStageInstance;

export interface WorkflowStageDefinition {
  id: string;
  key: string;
  name: string;
  sort_order: number;
  estimated_hours: number;
  enabled: boolean;
  execution_mode: WorkflowStageExecutionMode;
  item_type: WorkflowItemType;
  room_ids: string[];
  document_items?: WorkflowDocumentItemDefinition[];
  legacy_phase_kind: PhaseKind | null;
  /** @deprecated Migrated to `execution_mode` / `item_type` on read */
  scope?: "project" | "room";
  /** @deprecated Migrated to `execution_mode` / `item_type` on read */
  room_required?: boolean;
}

export interface WorkflowGroupDefinition {
  id: string;
  key: string;
  name: string;
  sort_order: number;
  estimated_hours: number;
  enabled: boolean;
  scope: WorkflowGroupScope;
  room_ids: string[];
  stages: WorkflowStageDefinition[];
}

export interface HierarchicalWorkflowDefinition {
  version: 2;
  groups: WorkflowGroupDefinition[];
}

export interface WorkflowRoomItemView {
  stage_id: string;
  stage_key: string;
  stage_name: string;
  estimated_hours: number;
  instance_id: string | null;
  phase_id: string | null;
  status: WorkflowItemStatus;
  progress_percent: number;
}

export interface WorkflowGroupRoomView {
  room_id: string;
  room_name: string;
  status: WorkflowItemStatus;
  progress_percent: number;
  items: WorkflowRoomItemView[];
}

export interface WorkflowStageView {
  id: string;
  key: string;
  name: string;
  sort_order: number;
  estimated_hours: number;
  enabled: boolean;
  execution_mode: WorkflowStageExecutionMode;
  item_type: WorkflowItemType;
  room_ids: string[];
  legacy_phase_kind: PhaseKind | null;
  status: WorkflowItemStatus;
  progress_percent: number;
  instances: WorkflowStageInstanceView[];
  is_current: boolean;
}

export interface WorkflowStageInstanceView {
  id: string;
  stage_id: string;
  execution_mode: WorkflowStageExecutionMode;
  room_id: string | null;
  room_name: string | null;
  document_item_key: string | null;
  document_item_name: string | null;
  status: WorkflowItemStatus;
  progress_percent: number;
  estimated_minutes: number;
  estimated_hours: number;
  worked_minutes: number;
  sort_order: number;
  is_current: boolean;
  last_activity_at: string | null;
  completed_at: string | null;
  /** Internal timer binding — not for workspace display */
  timer_target_id: string | null;
}

export interface WorkflowGroupView {
  id: string;
  key: string;
  name: string;
  sort_order: number;
  estimated_hours: number;
  enabled: boolean;
  scope: WorkflowGroupScope;
  room_ids: string[];
  status: WorkflowItemStatus;
  progress_percent: number;
  stages: WorkflowStageView[];
  is_current: boolean;
  is_expanded: boolean;
}

export interface WorkflowContextView {
  group_id: string;
  group_name: string;
  group_scope: WorkflowGroupScope;
  stage_id: string;
  stage_name: string;
  execution_mode: WorkflowStageExecutionMode;
  item_type: WorkflowItemType;
  room_id: string | null;
  room_name: string | null;
  instance_id: string | null;
}

export interface ProjectWorkflowEngineView {
  project_id: string;
  progress_percent: number;
  groups: WorkflowGroupView[];
  current: WorkflowContextView | null;
}

export interface LegacyPhaseSnapshot {
  id: string;
  room_id: string;
  phase_kind: PhaseKind;
  status: PhaseStatus;
}

export interface LegacyTaskSnapshot {
  phase_id: string;
  room_id: string;
  status: TaskStatus;
}

export interface StageInstanceWorkData {
  instance_id: string;
  timer_target_id: string | null;
  document_item_name: string | null;
  activeSession: WorkSession | null;
  history: PhaseWorkSessionHistoryEntry[];
  stats: PhaseWorkStats;
  activeWaiting: WorkflowWaitingEvent | null;
  waitingHistory: WorkflowWaitingEvent[];
}

export interface StageWorkData {
  execution_mode: WorkflowStageExecutionMode;
  item_type: WorkflowItemType;
  activeSession: WorkSession | null;
  history: PhaseWorkSessionHistoryEntry[];
  stats: PhaseWorkStats;
  instances: Record<string, StageInstanceWorkData>;
}
