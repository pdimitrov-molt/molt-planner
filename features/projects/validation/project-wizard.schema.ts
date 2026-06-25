import { z } from "zod";

import { createClientSchema } from "@/features/clients/validation/client.schema";
import {
  PROJECT_PRIORITIES,
  PROJECT_TYPES,
} from "@/features/projects/types/project";
import { wizardRoomSchema } from "@/features/rooms/validation/room.schema";
import { bg } from "@/src/i18n/bg";

export const wizardProjectSchema = z.object({
  name: z.string().trim().min(1, bg.validation.projectNameRequired).max(200),
  project_type: z.enum(PROJECT_TYPES, {
    message: bg.validation.projectTypeRequired,
  }),
  site_address: z.string().trim().max(500).optional(),
  site_area: z
    .number()
    .positive(bg.validation.areaPositive)
    .nullable()
    .optional(),
  priority: z.enum(PROJECT_PRIORITIES).default("normal"),
});

export const existingClientSelectionSchema = z.object({
  mode: z.literal("existing"),
  client_id: z.string().uuid(bg.validation.clientRequired),
});

export const newClientSelectionSchema = z.object({
  mode: z.literal("new"),
  client: createClientSchema,
});

export const wizardClientSchema = z.discriminatedUnion("mode", [
  existingClientSelectionSchema,
  newClientSelectionSchema,
]);

export const projectWizardSchema = z.object({
  client: wizardClientSchema,
  project: wizardProjectSchema,
  rooms: z
    .array(wizardRoomSchema)
    .min(1, bg.validation.roomSelectionRequired),
});

export type WizardProjectInput = z.infer<typeof wizardProjectSchema>;
export type WizardClientSelection = z.infer<typeof wizardClientSchema>;
export type ProjectWizardInput = z.infer<typeof projectWizardSchema>;

export function normalizeWizardProjectInput(input: WizardProjectInput) {
  return {
    name: input.name.trim(),
    project_type: input.project_type,
    site_address: input.site_address?.trim() ? input.site_address.trim() : null,
    site_area: input.site_area ?? null,
    priority: input.priority,
    engagement_status: "active" as const,
  };
}

export function formatValidationErrors(
  error: z.ZodError
): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const fieldName = issue.path.join(".");

    if (!fieldErrors[fieldName]) {
      fieldErrors[fieldName] = [];
    }

    fieldErrors[fieldName].push(issue.message);
  }

  return fieldErrors;
}
