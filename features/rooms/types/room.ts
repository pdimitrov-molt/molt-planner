import { bg } from "@/src/i18n/bg";

export const ROOM_KINDS = [
  "living",
  "bedroom",
  "kitchen",
  "bathroom",
  "office",
  "retail",
  "other",
] as const;

export const ROOM_PRIORITIES = ["low", "normal", "high"] as const;

export type RoomKind = (typeof ROOM_KINDS)[number];
export type RoomPriority = (typeof ROOM_PRIORITIES)[number];

export interface Room {
  id: string;
  project_id: string;
  room_template_key: string | null;
  name: string;
  room_kind: RoomKind;
  scope_summary: string | null;
  priority: RoomPriority;
  current_phase_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface RoomRow {
  id: string;
  project_id: string;
  room_template_key: string | null;
  name: string;
  room_kind: string;
  scope_summary: string | null;
  priority: string;
  current_phase_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export const ROOM_KIND_LABELS: Record<RoomKind, string> = bg.labels.roomKind;

export const ROOM_PRIORITY_LABELS: Record<RoomPriority, string> =
  bg.labels.roomPriority;

export function isRoomKind(value: string): value is RoomKind {
  return ROOM_KINDS.includes(value as RoomKind);
}

export function isRoomPriority(value: string): value is RoomPriority {
  return ROOM_PRIORITIES.includes(value as RoomPriority);
}

export function mapRoomRow(row: RoomRow): Room {
  if (!isRoomKind(row.room_kind)) {
    throw new Error(`Invalid room kind: ${row.room_kind}`);
  }

  if (!isRoomPriority(row.priority)) {
    throw new Error(`Invalid room priority: ${row.priority}`);
  }

  return {
    id: row.id,
    project_id: row.project_id,
    room_template_key: row.room_template_key,
    name: row.name,
    room_kind: row.room_kind,
    scope_summary: row.scope_summary,
    priority: row.priority,
    current_phase_id: row.current_phase_id,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at ?? row.created_at,
    deleted_at: row.deleted_at,
  };
}
