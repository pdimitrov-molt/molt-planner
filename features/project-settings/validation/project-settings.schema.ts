import { z } from "zod";

import { PHASE_KINDS } from "@/features/phases/types/phase";
import {
  ENGAGEMENT_STATUSES,
  PROJECT_CATEGORIES,
  PROJECT_OBJECT_TYPES,
  PROJECT_PACKAGES,
  PROJECT_PRIORITIES,
} from "@/features/projects/types/project";
import { WORKFLOW_TYPES } from "@/features/project-settings/types/workflow-type";
import { WORKFLOW_STAGE_EXECUTION_MODES } from "@/features/workflow-engine/types/workflow-engine";

const nullableDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")
  .nullable()
  .optional();

const nullableHours = z
  .number()
  .min(0, "Hours must be zero or greater")
  .nullable()
  .optional();

export const projectSettingsIdSchema = z.object({
  project_id: z.string().uuid("Project identifier is invalid"),
});

export const updateProjectGeneralSettingsSchema = projectSettingsIdSchema.extend({
  name: z.string().trim().min(1, "Project name is required").max(200),
  project_number: z.string().trim().min(1, "Project number is required").max(32),
  category: z.enum(PROJECT_CATEGORIES),
  object_type: z.enum(PROJECT_OBJECT_TYPES),
  site_address: z.string().trim().max(500).optional(),
  site_area: z.number().positive("Area must be greater than zero").nullable().optional(),
  engagement_status: z.enum(ENGAGEMENT_STATUSES),
  priority: z.enum(PROJECT_PRIORITIES),
});

export const updateProjectClientSettingsSchema = projectSettingsIdSchema.extend({
  client_id: z.string().uuid("Client is required"),
});

export const updateProjectPackageSettingsSchema = projectSettingsIdSchema.extend({
  package: z.enum(PROJECT_PACKAGES),
});

export const updateProjectDeadlinesSettingsSchema = projectSettingsIdSchema.extend({
  design_deadline: nullableDate,
  execution_deadline: nullableDate,
  move_in_date: nullableDate,
  estimated_design_hours: nullableHours,
  estimated_execution_hours: nullableHours,
});

/** @deprecated Use updateProjectDeadlinesSettingsSchema */
export const updateProjectScheduleSettingsSchema = updateProjectDeadlinesSettingsSchema;

export const updateProjectWorkflowTypeSchema = projectSettingsIdSchema.extend({
  workflow_type: z.enum(WORKFLOW_TYPES),
});

const workflowDocumentItemSchema = z.object({
  id: z.string().uuid(),
  key: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(120),
  sort_order: z.number().int().min(0),
  enabled: z.boolean(),
});

export const workflowStageDefinitionSchema = z.object({
  id: z.string().uuid(),
  key: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1, "Stage name is required").max(120),
  sort_order: z.number().int().min(0),
  estimated_hours: z.number().min(0.5, "Hours must be at least 0.5"),
  enabled: z.boolean(),
  execution_mode: z.enum(WORKFLOW_STAGE_EXECUTION_MODES),
  item_type: z.enum(["PROJECT_ITEM", "ROOM_ITEM"]),
  room_ids: z.array(z.string().uuid()),
  document_items: z.array(workflowDocumentItemSchema).optional(),
  legacy_phase_kind: z.enum(PHASE_KINDS).nullable(),
});

export const workflowGroupDefinitionSchema = z.object({
  id: z.string().uuid(),
  key: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1, "Group name is required").max(120),
  sort_order: z.number().int().min(0),
  estimated_hours: z.number().min(0),
  enabled: z.boolean(),
  scope: z.enum(["PROJECT", "ROOM"]),
  room_ids: z.array(z.string().uuid()),
  stages: z.array(workflowStageDefinitionSchema).min(1),
});

export const projectTeamSettingsSchema = z.object({
  designer: z.string().trim().max(120),
  visualizer: z.string().trim().max(120),
  technical_designer: z.string().trim().max(120),
  project_manager: z.string().trim().max(120),
});

export const projectFileEntrySchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  note: z.string().trim().max(500).nullable(),
  url: z.string().trim().max(500).nullable(),
  created_at: z.string(),
});

export const updateProjectSettingsExtrasSchema = projectSettingsIdSchema.extend({
  team: projectTeamSettingsSchema,
  document_templates: z.array(workflowDocumentItemSchema),
  files: z.array(projectFileEntrySchema),
});

export const createProjectRoomSettingsSchema = projectSettingsIdSchema.extend({
  name: z.string().trim().min(1, "Room name is required").max(200),
});

export const updateProjectRoomSettingsSchema = projectSettingsIdSchema.extend({
  room_id: z.string().uuid(),
  name: z.string().trim().min(1, "Room name is required").max(200),
});

export const archiveProjectRoomSettingsSchema = projectSettingsIdSchema.extend({
  room_id: z.string().uuid(),
});

export const reorderProjectRoomsSettingsSchema = projectSettingsIdSchema.extend({
  room_ids: z.array(z.string().uuid()).min(1),
});

export const updateProjectWorkflowGroupsSchema = projectSettingsIdSchema.extend({
  groups: z.array(workflowGroupDefinitionSchema).min(1, "At least one group is required"),
});

/** @deprecated Use workflowStageDefinitionSchema */
export const workflowStageSchema = workflowStageDefinitionSchema;

/** @deprecated Use updateProjectWorkflowGroupsSchema */
export const updateProjectWorkflowStagesSchema = projectSettingsIdSchema.extend({
  stages: z.array(workflowStageDefinitionSchema).min(1, "At least one stage is required"),
});

export type UpdateProjectGeneralSettingsInput = z.infer<
  typeof updateProjectGeneralSettingsSchema
>;

export type UpdateProjectClientSettingsInput = z.infer<
  typeof updateProjectClientSettingsSchema
>;
export type UpdateProjectPackageSettingsInput = z.infer<
  typeof updateProjectPackageSettingsSchema
>;
export type UpdateProjectDeadlinesSettingsInput = z.infer<
  typeof updateProjectDeadlinesSettingsSchema
>;
export type UpdateProjectSettingsExtrasInput = z.infer<
  typeof updateProjectSettingsExtrasSchema
>;
export type CreateProjectRoomSettingsInput = z.infer<
  typeof createProjectRoomSettingsSchema
>;
export type UpdateProjectRoomSettingsInput = z.infer<
  typeof updateProjectRoomSettingsSchema
>;
export type ArchiveProjectRoomSettingsInput = z.infer<
  typeof archiveProjectRoomSettingsSchema
>;
export type ReorderProjectRoomsSettingsInput = z.infer<
  typeof reorderProjectRoomsSettingsSchema
>;
export type UpdateProjectWorkflowTypeInput = z.infer<
  typeof updateProjectWorkflowTypeSchema
>;
export type UpdateProjectWorkflowGroupsInput = z.infer<
  typeof updateProjectWorkflowGroupsSchema
>;
export type UpdateProjectWorkflowStagesInput = z.infer<
  typeof updateProjectWorkflowStagesSchema
>;

export function normalizeGeneralSettingsInput(
  input: UpdateProjectGeneralSettingsInput
) {
  return {
    ...input,
    site_address: input.site_address?.trim() ? input.site_address.trim() : null,
    site_area: input.site_area ?? null,
  };
}

export type UpdateProjectScheduleSettingsInput = UpdateProjectDeadlinesSettingsInput;

export function normalizeDeadlinesSettingsInput(
  input: UpdateProjectDeadlinesSettingsInput
) {
  return {
    ...input,
    design_deadline: input.design_deadline ?? null,
    execution_deadline: input.execution_deadline ?? null,
    move_in_date: input.move_in_date ?? null,
    estimated_design_hours: input.estimated_design_hours ?? null,
    estimated_execution_hours: input.estimated_execution_hours ?? null,
  };
}

/** @deprecated Use normalizeDeadlinesSettingsInput */
export function normalizeScheduleSettingsInput(
  input: UpdateProjectDeadlinesSettingsInput
) {
  return normalizeDeadlinesSettingsInput(input);
}
