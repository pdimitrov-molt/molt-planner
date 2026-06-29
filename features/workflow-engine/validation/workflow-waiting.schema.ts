import { z } from "zod";

import { WORKFLOW_WAITING_REASONS } from "@/features/workflow-engine/types/workflow-waiting-event";

export const startWaitingSchema = z
  .object({
    project_id: z.string().uuid(),
    workflow_instance_id: z.string().uuid(),
    reason: z.enum(WORKFLOW_WAITING_REASONS),
    custom_reason: z.string().trim().max(500).nullable().optional(),
    expected_end_at: z.string().datetime().nullable().optional(),
    notes: z.string().trim().max(4000).nullable().optional(),
  })
  .superRefine((value, context) => {
    if (value.reason === "other" && !value.custom_reason?.trim()) {
      context.addIssue({
        code: "custom",
        message: "Custom reason is required when reason is other.",
        path: ["custom_reason"],
      });
    }
  });

export const finishWaitingSchema = z.object({
  workflow_instance_id: z.string().uuid(),
});

export const cancelWaitingSchema = z.object({
  workflow_instance_id: z.string().uuid(),
});

export const getCurrentWaitingSchema = z.object({
  workflow_instance_id: z.string().uuid(),
});

export type StartWaitingInput = z.infer<typeof startWaitingSchema>;
export type FinishWaitingInput = z.infer<typeof finishWaitingSchema>;
export type CancelWaitingInput = z.infer<typeof cancelWaitingSchema>;
export type GetCurrentWaitingInput = z.infer<typeof getCurrentWaitingSchema>;
