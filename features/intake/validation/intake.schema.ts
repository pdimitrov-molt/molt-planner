import { z } from "zod";

import {
  PROJECT_CATEGORIES,
  PROJECT_OBJECT_TYPES,
  PROJECT_PACKAGES,
} from "@/features/projects/types/project";

export const intakeScopeSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("manual"),
    site_area: z.number().min(0).nullable(),
    approximate_room_count: z.number().int().min(1).max(50),
    selected_template_room_keys: z.array(z.string()).default([]),
  }),
  z.object({
    mode: z.literal("template"),
    site_area: z.number().min(0).nullable(),
    approximate_room_count: z.number().int().min(1).max(50).default(1),
    selected_template_room_keys: z.array(z.string()).min(1),
  }),
]);

export const intakeSimulationSchema = z.object({
  category: z.enum(PROJECT_CATEGORIES),
  object_type: z.enum(PROJECT_OBJECT_TYPES).optional(),
  package: z.enum(PROJECT_PACKAGES).optional(),
  scope: intakeScopeSchema,
});

export type IntakeSimulationPayload = z.infer<typeof intakeSimulationSchema>;
