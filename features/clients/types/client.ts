import { bg } from "@/src/i18n/bg";

export const PREFERRED_CHANNELS = [
  "phone",
  "email",
  "viber",
  "whatsapp",
  "in_person",
] as const;

export type PreferredChannel = (typeof PREFERRED_CHANNELS)[number];

export interface Client {
  id: string;
  display_name: string;
  contact_phone: string | null;
  contact_email: string | null;
  contact_viber: string | null;
  contact_whatsapp: string | null;
  secondary_contact: string | null;
  preferred_channel: PreferredChannel;
  client_insights: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ClientRow {
  id: string;
  display_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  contact_viber: string | null;
  contact_whatsapp: string | null;
  secondary_contact: string | null;
  preferred_channel: string;
  client_insights: string | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export const PREFERRED_CHANNEL_LABELS: Record<PreferredChannel, string> =
  bg.labels.preferredChannel;

const LEGACY_PREFERRED_CHANNEL_ALIASES: Record<string, PreferredChannel> = {
  phone: "phone",
  email: "email",
  viber: "viber",
  whatsapp: "whatsapp",
  in_person: "in_person",
};

export function normalizePreferredChannel(value: string): PreferredChannel | null {
  const key = value.trim().toLowerCase();
  return LEGACY_PREFERRED_CHANNEL_ALIASES[key] ?? null;
}

export function isPreferredChannel(value: string): value is PreferredChannel {
  return PREFERRED_CHANNELS.includes(value as PreferredChannel);
}

export function mapClientRow(row: ClientRow): Client {
  const preferredChannel =
    normalizePreferredChannel(row.preferred_channel) ?? "email";

  return {
    id: row.id,
    display_name: row.display_name,
    contact_phone: row.contact_phone,
    contact_email: row.contact_email,
    contact_viber: row.contact_viber ?? null,
    contact_whatsapp: row.contact_whatsapp ?? null,
    secondary_contact: row.secondary_contact ?? null,
    preferred_channel: preferredChannel,
    client_insights: row.client_insights,
    created_at: row.created_at,
    updated_at: row.updated_at ?? row.created_at,
    deleted_at: row.deleted_at,
  };
}
