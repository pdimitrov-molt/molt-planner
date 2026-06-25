import type { RoomTemplateSet } from "@/features/rooms/types/room-template";
import { bg } from "@/src/i18n/bg";

function buildTemplateSet(
  projectType: keyof typeof bg.roomTemplates,
  rooms: Array<{
    key: string;
    room_kind: RoomTemplateSet["rooms"][number]["room_kind"];
  }>
): RoomTemplateSet {
  const localized = bg.roomTemplates[projectType];

  return {
    project_type: projectType,
    name: localized.name,
    description: localized.description,
    rooms: rooms.map((room) => {
      const roomCopy = localized.rooms[
        room.key as keyof typeof localized.rooms
      ] as { name: string; summary: string } | undefined;

      return {
        key: room.key,
        default_name: roomCopy?.name ?? room.key,
        room_kind: room.room_kind,
        scope_summary: roomCopy?.summary ?? "",
      };
    }),
  };
}

export const ROOM_TEMPLATE_SETS: RoomTemplateSet[] = [
  buildTemplateSet("residential", [
    { key: "living-room", room_kind: "living" },
    { key: "kitchen", room_kind: "kitchen" },
    { key: "master-bedroom", room_kind: "bedroom" },
    { key: "bathroom", room_kind: "bathroom" },
    { key: "home-office", room_kind: "office" },
  ]),
  buildTemplateSet("commercial", [
    { key: "reception", room_kind: "retail" },
    { key: "open-office", room_kind: "office" },
    { key: "meeting-room", room_kind: "office" },
    { key: "bathroom", room_kind: "bathroom" },
  ]),
  buildTemplateSet("hospitality", [
    { key: "lobby", room_kind: "retail" },
    { key: "guest-room", room_kind: "bedroom" },
    { key: "restaurant", room_kind: "living" },
    { key: "bathroom", room_kind: "bathroom" },
  ]),
  buildTemplateSet("renovation", [
    { key: "living-room", room_kind: "living" },
    { key: "kitchen", room_kind: "kitchen" },
    { key: "bathroom", room_kind: "bathroom" },
  ]),
  buildTemplateSet("staging", [
    { key: "living-room", room_kind: "living" },
    { key: "bedroom", room_kind: "bedroom" },
    { key: "kitchen", room_kind: "kitchen" },
  ]),
];

export function getRoomTemplateSet(projectType: RoomTemplateSet["project_type"]) {
  return ROOM_TEMPLATE_SETS.find((template) => template.project_type === projectType);
}

export function buildWizardRoomsFromTemplate(
  projectType: RoomTemplateSet["project_type"]
) {
  const templateSet = getRoomTemplateSet(projectType);

  if (!templateSet) {
    return [];
  }

  return templateSet.rooms.map((room, index) => ({
    key: `${room.key}-${index}`,
    name: room.default_name,
    room_kind: room.room_kind,
    scope_summary: room.scope_summary,
    room_template_key: room.key,
    sort_order: index,
  }));
}
