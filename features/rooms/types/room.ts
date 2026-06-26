import { bg } from "@/src/i18n/bg";

export const ROOM_KINDS = [
  "entrance",
  "hallway",
  "open_living_area",
  "kitchen",
  "dining_room",
  "master_bedroom",
  "bedroom",
  "kids_room",
  "guest_room",
  "walk_in_closet",
  "bathroom",
  "wc",
  "laundry",
  "storage",
  "pantry",
  "office",
  "terrace",
  "garage",
  "basement",
  "staircase",
  "reception",
  "lobby",
  "meeting_room",
  "open_office",
  "kitchenette",
  "server_room",
  "restroom",
  "restaurant",
  "bar",
  "hotel_room",
  "suite",
  "spa",
  "fitness",
  "medical_room",
  "retail_area",
  "waiting_area",
  "technical_room",
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

const LEGACY_ROOM_KIND_ALIASES: Record<string, RoomKind> = {
  living: "open_living_area",
  "living-room": "open_living_area",
  retail: "retail_area",
  "guest-room": "guest_room",
  "master-bedroom": "master_bedroom",
  "home-office": "office",
  "open-office": "open_office",
  "meeting-room": "meeting_room",
  "hotel-room": "hotel_room",
};

export function normalizeRoomKind(value: string): RoomKind | null {
  const trimmed = value.trim().toLowerCase();

  if (ROOM_KINDS.includes(trimmed as RoomKind)) {
    return trimmed as RoomKind;
  }

  return LEGACY_ROOM_KIND_ALIASES[trimmed] ?? null;
}

export function isRoomKind(value: string): value is RoomKind {
  return ROOM_KINDS.includes(value as RoomKind);
}

export function isRoomPriority(value: string): value is RoomPriority {
  return ROOM_PRIORITIES.includes(value as RoomPriority);
}

export function mapRoomRow(row: RoomRow): Room {
  const roomKind = normalizeRoomKind(row.room_kind);

  if (!roomKind) {
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
    room_kind: roomKind,
    scope_summary: row.scope_summary,
    priority: row.priority,
    current_phase_id: row.current_phase_id,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at ?? row.created_at,
    deleted_at: row.deleted_at,
  };
}

export function getRoomKindLabel(roomKind: RoomKind): string {
  return ROOM_KIND_LABELS[roomKind];
}
