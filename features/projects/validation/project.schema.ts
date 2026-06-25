import { z } from "zod";

import {
  ENGAGEMENT_STATUSES,
  PROJECT_PRIORITIES,
  PROJECT_TYPES,
} from "@/features/projects/types/project";

const sharedProjectFields = {
  name: z.string().trim().min(1, "Project name is required").max(200),
  project_type: z.enum(PROJECT_TYPES, {
    message: "Select a project type",
  }),
  site_address: z.string().trim().max(500).optional(),
  site_area: z
    .number()
    .positive("Area must be greater than zero")
    .nullable()
    .optional(),
  engagement_status: z.enum(ENGAGEMENT_STATUSES),
  priority: z.enum(PROJECT_PRIORITIES),
};

export const createProjectSchema = z.object({
  client_id: z.string().uuid("Client is required"),
  ...sharedProjectFields,
  engagement_status: z.enum(ENGAGEMENT_STATUSES).default("inquiry"),
  priority: z.enum(PROJECT_PRIORITIES).default("normal"),
});

export const updateProjectSchema = z.object({
  id: z.string().uuid("Project identifier is invalid"),
  client_id: z.string().uuid("Client is required"),
  ...sharedProjectFields,
});

export const deleteProjectSchema = z.object({
  id: z.string().uuid("Project identifier is invalid"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>;

export function normalizeProjectPayload<
  T extends Pick<
    CreateProjectInput,
    "site_address" | "site_area" | "engagement_status" | "priority"
  >,
>(input: T) {
  return {
    ...input,
    site_address: input.site_address?.trim() ? input.site_address.trim() : null,
    site_area: input.site_area ?? null,
  };
}

export function formatValidationErrors(
  error: z.ZodError
): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const fieldName = issue.path[0];

    if (typeof fieldName !== "string") {
      continue;
    }

    if (!fieldErrors[fieldName]) {
      fieldErrors[fieldName] = [];
    }

    fieldErrors[fieldName].push(issue.message);
  }

  return fieldErrors;
}
