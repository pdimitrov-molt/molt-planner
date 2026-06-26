import type { ProjectCategory } from "@/features/projects/types/project";
import type { RoomKind } from "@/features/rooms/types/room";

export interface RoomTemplateDefinition {
  key: string;
  default_name: string;
  room_kind: RoomKind;
  scope_summary: string;
}

export interface RoomTemplateSet {
  category: ProjectCategory;
  name: string;
  description: string;
  rooms: RoomTemplateDefinition[];
}

export interface WizardRoomDraft {
  key: string;
  name: string;
  room_kind: RoomKind;
  scope_summary: string;
  room_template_key: string | null;
  sort_order: number;
}
