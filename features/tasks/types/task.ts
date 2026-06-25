export const TASK_KINDS = [
  "site_visit",
  "client_presentation",
  "design_work",
  "sourcing",
  "coordination",
  "review",
  "administration",
] as const;

export const TASK_STATUSES = [
  "backlog",
  "scheduled",
  "in_progress",
  "blocked",
  "done",
] as const;

export type TaskKind = (typeof TASK_KINDS)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface Task {
  id: string;
  project_id: string;
  room_id: string;
  phase_id: string;
  title: string;
  description: string | null;
  task_kind: TaskKind;
  status: TaskStatus;
  estimated_hours: number;
  scheduled_date: string | null;
  due_date: string | null;
  assignee_id: string | null;
  blocked_reason: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface TaskRow {
  id: string;
  project_id: string;
  room_id: string;
  phase_id: string;
  title: string;
  description: string | null;
  task_kind: string;
  status: string;
  estimated_hours: number;
  scheduled_date: string | null;
  due_date: string | null;
  assignee_id: string | null;
  blocked_reason: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

import { bg } from "@/src/i18n/bg";

export const TASK_KIND_LABELS: Record<TaskKind, string> = {
  site_visit: bg.labels.taskKind.site_visit,
  client_presentation: bg.labels.taskKind.client_presentation,
  design_work: bg.labels.taskKind.design_work,
  sourcing: bg.labels.taskKind.sourcing,
  coordination: bg.labels.taskKind.coordination,
  review: bg.labels.taskKind.review,
  administration: bg.labels.taskKind.administration,
};

export function isTaskKind(value: string): value is TaskKind {
  return TASK_KINDS.includes(value as TaskKind);
}

export function isTaskStatus(value: string): value is TaskStatus {
  return TASK_STATUSES.includes(value as TaskStatus);
}

export function mapTaskRow(row: TaskRow): Task {
  if (!isTaskKind(row.task_kind)) {
    throw new Error(`Invalid task kind: ${row.task_kind}`);
  }

  if (!isTaskStatus(row.status)) {
    throw new Error(`Invalid task status: ${row.status}`);
  }

  return {
    id: row.id,
    project_id: row.project_id,
    room_id: row.room_id,
    phase_id: row.phase_id,
    title: row.title,
    description: row.description,
    task_kind: row.task_kind,
    status: row.status,
    estimated_hours: Number(row.estimated_hours),
    scheduled_date: row.scheduled_date,
    due_date: row.due_date,
    assignee_id: row.assignee_id,
    blocked_reason: row.blocked_reason,
    completed_at: row.completed_at,
    created_at: row.created_at,
    updated_at: row.updated_at ?? row.created_at,
    deleted_at: row.deleted_at,
  };
}
