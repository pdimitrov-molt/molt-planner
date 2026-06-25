import { z } from "zod";

import {
  DECISION_STYLES,
  PREFERRED_CHANNELS,
} from "@/features/clients/types/client";
import { bg } from "@/src/i18n/bg";

function optionalEmail(value: string | undefined) {
  if (!value || value.trim().length === 0) {
    return undefined;
  }

  return value.trim();
}

export const createClientSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(1, bg.validation.clientNameRequired)
    .max(200),
  contact_email: z
    .string()
    .trim()
    .max(200)
    .optional()
    .refine(
      (value) =>
        !value ||
        value.length === 0 ||
        z.string().email().safeParse(value).success,
      bg.validation.emailInvalid
    )
    .transform(optionalEmail),
  contact_phone: z.string().trim().max(50).optional(),
  preferred_channel: z.enum(PREFERRED_CHANNELS).default("email"),
  decision_style: z.enum(DECISION_STYLES).default("collaborative"),
  notes: z.string().trim().max(2000).optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;

export function normalizeCreateClientInput(input: CreateClientInput) {
  return {
    display_name: input.display_name.trim(),
    contact_email: input.contact_email ?? null,
    contact_phone: input.contact_phone?.trim() ? input.contact_phone.trim() : null,
    preferred_channel: input.preferred_channel,
    decision_style: input.decision_style,
    notes: input.notes?.trim() ? input.notes.trim() : null,
  };
}
