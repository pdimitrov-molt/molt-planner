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
  room_id: z.string().uuid(bg.validation.roomIdInvalid).nullable().optional(),
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

const manualSessionBaseSchema = {
  project_id: z.string().uuid(bg.validation.projectIdInvalid),
  room_id: z.string().uuid(bg.validation.roomIdInvalid).nullable().optional(),
  phase_id: z.string().uuid(bg.validation.phaseIdInvalid),
};

const manualTimeRangeSchema = z
  .object({
    mode: z.literal("range"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, bg.workSessionManual.invalidDate),
    start_time: z.string().regex(/^\d{2}:\d{2}$/, bg.workSessionManual.invalidTime),
    end_time: z.string().regex(/^\d{2}:\d{2}$/, bg.workSessionManual.invalidTime),
    note: z.string().trim().max(4000).optional(),
  })
  .superRefine((value, context) => {
    const start = Date.parse(`${value.date}T${value.start_time}:00`);
    const end = Date.parse(`${value.date}T${value.end_time}:00`);

    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: bg.workSessionManual.invalidTime,
        path: ["start_time"],
      });
      return;
    }

    if (end <= start) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: bg.workSessionManual.endBeforeStart,
        path: ["end_time"],
      });
    }
  });

const manualDurationSchema = z.object({
  mode: z.literal("duration"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, bg.workSessionManual.invalidDate),
  duration_minutes: z
    .number()
    .int()
    .min(1, bg.workSessionManual.durationRequired)
    .max(24 * 60),
  note: z.string().trim().max(4000).optional(),
});

export const logManualWorkSessionSchema = z.discriminatedUnion("mode", [
  manualTimeRangeSchema.extend(manualSessionBaseSchema),
  manualDurationSchema.extend(manualSessionBaseSchema),
]);

export const updateManualWorkSessionSchema = z.discriminatedUnion("mode", [
  manualTimeRangeSchema.extend({
    id: z.string().uuid("Invalid work session identifier."),
  }),
  manualDurationSchema.extend({
    id: z.string().uuid("Invalid work session identifier."),
  }),
]);

export const deleteWorkSessionSchema = z.object({
  id: z.string().uuid("Invalid work session identifier."),
});

export const completeStageManuallySchema = z.object({
  project_id: z.string().uuid(bg.validation.projectIdInvalid),
  room_id: z.string().uuid(bg.validation.roomIdInvalid).nullable().optional(),
  phase_id: z.string().uuid(bg.validation.phaseIdInvalid),
  actual_hours: z
    .number()
    .min(0, bg.workSessionManual.actualHoursInvalid)
    .max(999),
  note: z.string().trim().max(4000).optional(),
  move_to_next_stage: z.boolean().default(true),
});

export type StartWorkSessionInput = z.infer<typeof startWorkSessionSchema>;
export type PauseWorkSessionInput = z.infer<typeof pauseWorkSessionSchema>;
export type ResumeWorkSessionInput = z.infer<typeof resumeWorkSessionSchema>;
export type CompleteWorkSessionInput = z.infer<typeof completeWorkSessionSchema>;
export type FindWorkSessionsByPhaseInput = z.infer<
  typeof findWorkSessionsByPhaseSchema
>;
export type LogManualWorkSessionInput = z.infer<typeof logManualWorkSessionSchema>;
export type UpdateManualWorkSessionInput = z.infer<typeof updateManualWorkSessionSchema>;
export type DeleteWorkSessionInput = z.infer<typeof deleteWorkSessionSchema>;
export type CompleteStageManuallyInput = z.infer<typeof completeStageManuallySchema>;

export interface StartWorkSessionPayload {
  project_id: string;
  room_id: string | null;
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

export interface CreateCompletedWorkSessionPayload {
  project_id: string;
  room_id: string | null;
  phase_id: string;
  started_at: string;
  ended_at: string;
  duration_minutes: number;
  status: "completed";
  note: string | null;
  next_step: null;
  blocker: null;
}

export interface UpdateCompletedWorkSessionPayload {
  started_at: string;
  ended_at: string;
  duration_minutes: number;
  note: string | null;
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
