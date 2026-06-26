import type { ProjectCategory } from "@/features/projects/types/project";
import type { RoomTemplateSet } from "@/features/rooms/types/room-template";
import type { RoomKind } from "@/features/rooms/types/room";
import { getRoomKindLabel } from "@/features/rooms/types/room";
import { bg } from "@/src/i18n/bg";

function buildTemplateSet(
  category: ProjectCategory,
  rooms: Array<{ key: string; room_kind: RoomKind }>
): RoomTemplateSet {
  const localized = bg.roomTemplates[category];

  return {
    category,
    name: localized.name,
    description: localized.description,
    rooms: rooms.map((room) => ({
      key: room.key,
      default_name: getRoomKindLabel(room.room_kind),
      room_kind: room.room_kind,
      scope_summary: localized.defaultRoomSummary,
    })),
  };
}

const RESIDENTIAL_ROOMS: Array<{ key: string; room_kind: RoomKind }> = [
  { key: "entrance", room_kind: "entrance" },
  { key: "hallway", room_kind: "hallway" },
  { key: "open-living-area", room_kind: "open_living_area" },
  { key: "kitchen", room_kind: "kitchen" },
  { key: "dining-room", room_kind: "dining_room" },
  { key: "master-bedroom", room_kind: "master_bedroom" },
  { key: "bedroom", room_kind: "bedroom" },
  { key: "kids-room", room_kind: "kids_room" },
  { key: "guest-room", room_kind: "guest_room" },
  { key: "walk-in-closet", room_kind: "walk_in_closet" },
  { key: "bathroom", room_kind: "bathroom" },
  { key: "wc", room_kind: "wc" },
  { key: "laundry", room_kind: "laundry" },
  { key: "storage", room_kind: "storage" },
  { key: "pantry", room_kind: "pantry" },
  { key: "office", room_kind: "office" },
  { key: "terrace", room_kind: "terrace" },
  { key: "garage", room_kind: "garage" },
  { key: "basement", room_kind: "basement" },
  { key: "staircase", room_kind: "staircase" },
];

const COMMERCIAL_ROOMS: Array<{ key: string; room_kind: RoomKind }> = [
  { key: "reception", room_kind: "reception" },
  { key: "lobby", room_kind: "lobby" },
  { key: "office", room_kind: "office" },
  { key: "meeting-room", room_kind: "meeting_room" },
  { key: "open-office", room_kind: "open_office" },
  { key: "kitchenette", room_kind: "kitchenette" },
  { key: "storage", room_kind: "storage" },
  { key: "server-room", room_kind: "server_room" },
  { key: "restroom", room_kind: "restroom" },
  { key: "restaurant", room_kind: "restaurant" },
  { key: "kitchen", room_kind: "kitchen" },
  { key: "bar", room_kind: "bar" },
  { key: "hotel-room", room_kind: "hotel_room" },
  { key: "suite", room_kind: "suite" },
  { key: "spa", room_kind: "spa" },
  { key: "fitness", room_kind: "fitness" },
  { key: "medical-room", room_kind: "medical_room" },
  { key: "retail-area", room_kind: "retail_area" },
  { key: "waiting-area", room_kind: "waiting_area" },
  { key: "technical-room", room_kind: "technical_room" },
  { key: "other", room_kind: "other" },
];

export const ROOM_TEMPLATE_SETS: RoomTemplateSet[] = [
  buildTemplateSet("residential", RESIDENTIAL_ROOMS),
  buildTemplateSet("commercial", COMMERCIAL_ROOMS),
];

const DEFAULT_RESIDENTIAL_TEMPLATE_KEYS = [
  "open-living-area",
  "kitchen",
  "master-bedroom",
  "bathroom",
  "office",
];

export function getRoomTemplateSet(category: ProjectCategory) {
  return ROOM_TEMPLATE_SETS.find((template) => template.category === category);
}

export function buildWizardRoomsFromTemplate(category: ProjectCategory) {
  const templateSet = getRoomTemplateSet(category);

  if (!templateSet) {
    return [];
  }

  const selectedRooms =
    category === "residential"
      ? templateSet.rooms.filter((room) =>
          DEFAULT_RESIDENTIAL_TEMPLATE_KEYS.includes(room.key)
        )
      : templateSet.rooms.filter((room) =>
          ["reception", "open-office", "meeting-room", "restroom"].includes(room.key)
        );

  return selectedRooms.map((room, index) => ({
    key: `${room.key}-${index}`,
    name: room.default_name,
    room_kind: room.room_kind,
    scope_summary: room.scope_summary,
    room_template_key: room.key,
    sort_order: index,
  }));
}
