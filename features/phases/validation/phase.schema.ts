import { z } from "zod";

import { bg } from "@/src/i18n/bg";

export const completePhaseSchema = z.object({
  phase_id: z.string().uuid(bg.validation.phaseIdInvalid),
  project_id: z.string().uuid(bg.validation.projectIdInvalid),
  room_id: z.string().uuid(bg.validation.roomIdInvalid),
});

export type CompletePhaseInput = z.infer<typeof completePhaseSchema>;
