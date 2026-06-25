import { bg } from "@/src/i18n/bg";

export const PREFERRED_CHANNELS = [
  "email",
  "phone",
  "whatsapp",
  "in_person",
] as const;

export const DECISION_STYLES = [
  "fast",
  "collaborative",
  "slow",
  "committee",
] as const;

export type PreferredChannel = (typeof PREFERRED_CHANNELS)[number];
export type DecisionStyle = (typeof DECISION_STYLES)[number];

export interface Client {
  id: string;
  display_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  preferred_channel: PreferredChannel;
  decision_style: DecisionStyle;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ClientRow {
  id: string;
  display_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  preferred_channel: string;
  decision_style: string;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export const PREFERRED_CHANNEL_LABELS: Record<PreferredChannel, string> =
  bg.labels.preferredChannel;

export const DECISION_STYLE_LABELS: Record<DecisionStyle, string> =
  bg.labels.decisionStyle;

export function isPreferredChannel(value: string): value is PreferredChannel {
  return PREFERRED_CHANNELS.includes(value as PreferredChannel);
}

export function isDecisionStyle(value: string): value is DecisionStyle {
  return DECISION_STYLES.includes(value as DecisionStyle);
}

export function mapClientRow(row: ClientRow): Client {
  if (!isPreferredChannel(row.preferred_channel)) {
    throw new Error(`Invalid preferred channel: ${row.preferred_channel}`);
  }

  if (!isDecisionStyle(row.decision_style)) {
    throw new Error(`Invalid decision style: ${row.decision_style}`);
  }

  return {
    id: row.id,
    display_name: row.display_name,
    contact_email: row.contact_email,
    contact_phone: row.contact_phone,
    preferred_channel: row.preferred_channel,
    decision_style: row.decision_style,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at ?? row.created_at,
    deleted_at: row.deleted_at,
  };
}
