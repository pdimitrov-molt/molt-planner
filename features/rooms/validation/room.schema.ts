import { z } from "zod";

import { ROOM_KINDS } from "@/features/rooms/types/room";
import { bg } from "@/src/i18n/bg";

export const wizardRoomSchema = z.object({
  name: z.string().trim().min(1, bg.validation.roomNameRequired).max(200),
  room_kind: z.enum(ROOM_KINDS, { message: bg.validation.roomTypeRequired }),
  scope_summary: z.string().trim().max(500).optional(),
  room_template_key: z.string().trim().max(100).nullable().optional(),
  sort_order: z.number().int().min(0),
});

export type WizardRoomInput = z.infer<typeof wizardRoomSchema>;

export function normalizeWizardRoomInput(input: WizardRoomInput) {
  return {
    name: input.name.trim(),
    room_kind: input.room_kind,
    scope_summary: input.scope_summary?.trim() ? input.scope_summary.trim() : null,
    room_template_key: input.room_template_key ?? null,
    sort_order: input.sort_order,
    priority: "normal" as const,
  };
}
