import { z } from "zod";

import {
  ENGAGEMENT_STATUSES,
  PROJECT_CATEGORIES,
  PROJECT_OBJECT_TYPES,
  PROJECT_PACKAGES,
  PROJECT_PRIORITIES,
} from "@/features/projects/types/project";

const sharedProjectFields = {
  name: z.string().trim().min(1, "Project name is required").max(200),
  category: z.enum(PROJECT_CATEGORIES, {
    message: "Select a project category",
  }),
  object_type: z.enum(PROJECT_OBJECT_TYPES, {
    message: "Select an object type",
  }),
  package: z.enum(PROJECT_PACKAGES, {
    message: "Select a package",
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
