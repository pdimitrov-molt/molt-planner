export const WORK_SESSION_STATUSES = [
  "running",
  "paused",
  "completed",
  "cancelled",
] as const;

export type WorkSessionStatus = (typeof WORK_SESSION_STATUSES)[number];

export interface WorkSession {
  id: string;
  project_id: string;
  room_id: string | null;
  phase_id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  status: WorkSessionStatus;
  note: string | null;
  next_step: string | null;
  blocker: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WorkSessionRow {
  id: string;
  project_id: string;
  room_id: string | null;
  phase_id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  status: string;
  note: string | null;
  next_step: string | null;
  blocker: string | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export function isWorkSessionStatus(value: string): value is WorkSessionStatus {
  return WORK_SESSION_STATUSES.includes(value as WorkSessionStatus);
}

export function mapWorkSessionRow(row: WorkSessionRow): WorkSession {
  if (!isWorkSessionStatus(row.status)) {
    throw new Error(`Invalid work session status: ${row.status}`);
  }

  return {
    id: row.id,
    project_id: row.project_id,
    room_id: row.room_id,
    phase_id: row.phase_id,
    started_at: row.started_at,
    ended_at: row.ended_at,
    duration_minutes: row.duration_minutes,
    status: row.status,
    note: row.note,
    next_step: row.next_step,
    blocker: row.blocker,
    created_at: row.created_at,
    updated_at: row.updated_at ?? row.created_at,
    deleted_at: row.deleted_at,
  };
}
