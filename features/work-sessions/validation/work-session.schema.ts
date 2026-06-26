import { z } from "zod";

import { bg } from "@/src/i18n/bg";

function optionalText(value: string | undefined) {
  if (!value || value.trim().length === 0) {
    return null;
  }

  return value.trim();
}

export const startWorkSessionSchema = z.object({
  project_id: z.string().uuid(bg.validation.projectIdInvalid),
  room_id: z.string().uuid(bg.validation.roomIdInvalid),
  phase_id: z.string().uuid(bg.validation.phaseIdInvalid),
});

export const pauseWorkSessionSchema = z.object({
  id: z.string().uuid("Invalid work session identifier."),
});

export const resumeWorkSessionSchema = z.object({
  id: z.string().uuid("Invalid work session identifier."),
});

export const completeWorkSessionSchema = z.object({
  id: z.string().uuid("Invalid work session identifier."),
  note: z.string().trim().max(4000).optional(),
  next_step: z.string().trim().max(2000).optional(),
  blocker: z.string().trim().max(2000).optional(),
});

export const findWorkSessionsByPhaseSchema = z.object({
  phase_id: z.string().uuid(bg.validation.phaseIdInvalid),
});

export type StartWorkSessionInput = z.infer<typeof startWorkSessionSchema>;
export type PauseWorkSessionInput = z.infer<typeof pauseWorkSessionSchema>;
export type ResumeWorkSessionInput = z.infer<typeof resumeWorkSessionSchema>;
export type CompleteWorkSessionInput = z.infer<typeof completeWorkSessionSchema>;
export type FindWorkSessionsByPhaseInput = z.infer<
  typeof findWorkSessionsByPhaseSchema
>;

export interface StartWorkSessionPayload {
  project_id: string;
  room_id: string;
  phase_id: string;
  started_at: string;
  status: "running";
  ended_at: null;
  duration_minutes: null;
  note: null;
  next_step: null;
  blocker: null;
}

export interface CompleteWorkSessionPayload {
  ended_at: string;
  duration_minutes: number;
  status: "completed";
  note: string | null;
  next_step: string | null;
  blocker: string | null;
}

export function normalizeCompleteWorkSessionInput(
  input: CompleteWorkSessionInput
): {
  id: string;
  note: string | null;
  next_step: string | null;
  blocker: string | null;
} {
  return {
    id: input.id,
    note: optionalText(input.note),
    next_step: optionalText(input.next_step),
    blocker: optionalText(input.blocker),
  };
}
