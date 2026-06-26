import { z } from "zod";

import { PREFERRED_CHANNELS } from "@/features/clients/types/client";
import { bg } from "@/src/i18n/bg";

function optionalEmail(value: string | undefined) {
  if (!value || value.trim().length === 0) {
    return undefined;
  }

  return value.trim();
}

function optionalContact(value: string | undefined) {
  if (!value || value.trim().length === 0) {
    return null;
  }

  return value.trim();
}

const clientFieldsSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(1, bg.validation.clientNameRequired)
    .max(200),
  contact_phone: z.string().trim().max(50).optional(),
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
  contact_viber: z.string().trim().max(100).optional(),
  contact_whatsapp: z.string().trim().max(100).optional(),
  secondary_contact: z.string().trim().max(200).optional(),
  preferred_channel: z.enum(PREFERRED_CHANNELS).default("email"),
  client_insights: z.string().trim().max(4000).optional(),
});

export const createClientSchema = clientFieldsSchema;

export const updateClientSchema = clientFieldsSchema.partial().extend({
  id: z.string().uuid(bg.validation.clientIdInvalid),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;

export interface ClientWritePayload {
  display_name: string;
  contact_phone: string | null;
  contact_email: string | null;
  contact_viber: string | null;
  contact_whatsapp: string | null;
  secondary_contact: string | null;
  preferred_channel: CreateClientInput["preferred_channel"];
  client_insights: string | null;
}

export type ClientUpdatePayload = Partial<ClientWritePayload>;

export function normalizeCreateClientInput(input: CreateClientInput): ClientWritePayload {
  return {
    display_name: input.display_name.trim(),
    contact_phone: optionalContact(input.contact_phone),
    contact_email: input.contact_email ?? null,
    contact_viber: optionalContact(input.contact_viber),
    contact_whatsapp: optionalContact(input.contact_whatsapp),
    secondary_contact: optionalContact(input.secondary_contact),
    preferred_channel: input.preferred_channel,
    client_insights: optionalContact(input.client_insights),
  };
}

export function normalizeUpdateClientInput(input: UpdateClientInput): ClientUpdatePayload {
  const payload: ClientUpdatePayload = {};

  if (input.display_name !== undefined) {
    payload.display_name = input.display_name.trim();
  }

  if (input.contact_phone !== undefined) {
    payload.contact_phone = optionalContact(input.contact_phone);
  }

  if (input.contact_email !== undefined) {
    payload.contact_email = input.contact_email ?? null;
  }

  if (input.contact_viber !== undefined) {
    payload.contact_viber = optionalContact(input.contact_viber);
  }

  if (input.contact_whatsapp !== undefined) {
    payload.contact_whatsapp = optionalContact(input.contact_whatsapp);
  }

  if (input.secondary_contact !== undefined) {
    payload.secondary_contact = optionalContact(input.secondary_contact);
  }

  if (input.preferred_channel !== undefined) {
    payload.preferred_channel = input.preferred_channel;
  }

  if (input.client_insights !== undefined) {
    payload.client_insights = optionalContact(input.client_insights);
  }

  return payload;
}
