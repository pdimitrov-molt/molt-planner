import { ZodError } from "zod";

import { RoomRepository } from "@/features/rooms/repository/room.repository";
import { buildDesignWorkflowForPackage } from "@/features/workflow-engine/data/default-design-workflow";
import {
  recalculateGroupHours,
} from "@/features/workflow-engine/lib/recalculate-group-hours";
import {
  hasPersistedHierarchicalWorkflow,
  parseHierarchicalWorkflow,
  serializeHierarchicalWorkflow,
} from "@/features/workflow-engine/lib/parse-hierarchical-workflow";
import {
  migrateWorkflowDefinitionForPackage,
  needsWorkflowDefinitionMigration,
} from "@/features/workflow-engine/lib/workflow-definition-migration";
import { normalizeGroupDefinition } from "@/features/workflow-engine/lib/workflow-scope";
import type { WorkflowGroupDefinition } from "@/features/workflow-engine/types/workflow-engine";
import type { Room } from "@/features/rooms/types/room";
import { ProjectSettingsRepository } from "@/features/project-settings/repository/project-settings.repository";
import { WorkflowEngineRepository } from "@/features/workflow-engine/repository/workflow-engine.repository";
import type { ProjectSettingsView } from "@/features/project-settings/types/project-settings";
import {
  archiveProjectRoomSettingsSchema,
  createProjectRoomSettingsSchema,
  reorderProjectRoomsSettingsSchema,
  updateProjectClientSettingsSchema,
  updateProjectDeadlinesSettingsSchema,
  updateProjectGeneralSettingsSchema,
  updateProjectPackageSettingsSchema,
  updateProjectSettingsExtrasSchema,
  updateProjectRoomSettingsSchema,
  updateProjectWorkflowGroupsSchema,
  updateProjectWorkflowTypeSchema,
  type ArchiveProjectRoomSettingsInput,
  type CreateProjectRoomSettingsInput,
  type ReorderProjectRoomsSettingsInput,
  type UpdateProjectClientSettingsInput,
  type UpdateProjectDeadlinesSettingsInput,
  type UpdateProjectGeneralSettingsInput,
  type UpdateProjectPackageSettingsInput,
  type UpdateProjectSettingsExtrasInput,
  type UpdateProjectRoomSettingsInput,
  type UpdateProjectWorkflowGroupsInput,
  type UpdateProjectWorkflowTypeInput,
} from "@/features/project-settings/validation/project-settings.schema";
import { bg } from "@/src/i18n/bg";

export class ProjectSettingsService {
  constructor(
    private readonly repository: ProjectSettingsRepository,
    private readonly workflowEngineRepository: WorkflowEngineRepository,
    private readonly roomRepository: RoomRepository
  ) {}

  async getProjectSettings(projectId: string): Promise<ProjectSettingsView | null> {
    const record = await this.repository.findByProjectId(projectId);

    if (!record) {
      return null;
    }

    let definition = parseHierarchicalWorkflow(record.workflow_definition);
    const shouldMigrate =
      !hasPersistedHierarchicalWorkflow(record.workflow_definition) ||
      needsWorkflowDefinitionMigration(definition);

    if (shouldMigrate) {
      definition = migrateWorkflowDefinitionForPackage(record.project.package);
      await this.repository.updateWorkflowDefinition(
        projectId,
        serializeHierarchicalWorkflow(definition)
      );
      await this.workflowEngineRepository.syncStageInstances(projectId, definition);
    }

    const rooms = await this.roomRepository.findByProjectId(projectId);

    return {
      project: record.project,
      workflow_type: record.workflow_type,
      estimated_design_hours: record.estimated_design_hours,
      estimated_execution_hours: record.estimated_execution_hours,
      workflow_groups: definition.groups,
      rooms,
      settings_extras: record.settings_extras,
    };
  }

  async updateGeneralSettings(input: UpdateProjectGeneralSettingsInput) {
    const validated = updateProjectGeneralSettingsSchema.parse(input);
    const existing = await this.repository.findByProjectId(validated.project_id);

    if (!existing) {
      throw new Error("Project was not found.");
    }

    return this.repository.updateGeneral(validated);
  }

  async updateClientSettings(input: UpdateProjectClientSettingsInput) {
    const validated = updateProjectClientSettingsSchema.parse(input);
    const existing = await this.repository.findByProjectId(validated.project_id);

    if (!existing) {
      throw new Error("Project was not found.");
    }

    return this.repository.updateClient(validated);
  }

  async updatePackageSettings(input: UpdateProjectPackageSettingsInput) {
    const validated = updateProjectPackageSettingsSchema.parse(input);
    const existing = await this.repository.findByProjectId(validated.project_id);

    if (!existing) {
      throw new Error("Project was not found.");
    }

    return this.repository.updatePackage(validated);
  }

  async updateDeadlinesSettings(input: UpdateProjectDeadlinesSettingsInput) {
    const validated = updateProjectDeadlinesSettingsSchema.parse(input);
    const existing = await this.repository.findByProjectId(validated.project_id);

    if (!existing) {
      throw new Error("Project was not found.");
    }

    return this.repository.updateDeadlines(validated);
  }

  /** @deprecated Use updateDeadlinesSettings */
  async updateScheduleSettings(input: UpdateProjectDeadlinesSettingsInput) {
    return this.updateDeadlinesSettings(input);
  }

  async updateSettingsExtras(input: UpdateProjectSettingsExtrasInput) {
    const validated = updateProjectSettingsExtrasSchema.parse(input);
    const existing = await this.repository.findByProjectId(validated.project_id);

    if (!existing) {
      throw new Error("Project was not found.");
    }

    await this.repository.updateSettingsExtras(validated);
    return validated;
  }

  async createRoom(input: CreateProjectRoomSettingsInput): Promise<Room> {
    const validated = createProjectRoomSettingsSchema.parse(input);
    const existing = await this.repository.findByProjectId(validated.project_id);

    if (!existing) {
      throw new Error("Project was not found.");
    }

    const rooms = await this.roomRepository.findByProjectId(validated.project_id);

    return this.roomRepository.createRoom({
      project_id: validated.project_id,
      name: validated.name.trim(),
      room_kind: "other",
      scope_summary: null,
      room_template_key: null,
      sort_order: rooms.length,
      priority: "normal",
    });
  }

  async updateRoom(input: UpdateProjectRoomSettingsInput): Promise<Room> {
    const validated = updateProjectRoomSettingsSchema.parse(input);
    const rooms = await this.roomRepository.findByProjectId(validated.project_id);
    const room = rooms.find((entry) => entry.id === validated.room_id);

    if (!room) {
      throw new Error("Room was not found.");
    }

    return this.roomRepository.updateRoom(validated.room_id, {
      name: validated.name.trim(),
    });
  }

  async archiveRoom(input: ArchiveProjectRoomSettingsInput): Promise<void> {
    const validated = archiveProjectRoomSettingsSchema.parse(input);
    const rooms = await this.roomRepository.findByProjectId(validated.project_id);
    const room = rooms.find((entry) => entry.id === validated.room_id);

    if (!room) {
      throw new Error("Room was not found.");
    }

    await this.roomRepository.archiveRoom(validated.room_id);
  }

  async reorderRooms(input: ReorderProjectRoomsSettingsInput): Promise<Room[]> {
    const validated = reorderProjectRoomsSettingsSchema.parse(input);
    const rooms = await this.roomRepository.findByProjectId(validated.project_id);

    if (validated.room_ids.length !== rooms.length) {
      throw new Error("Room order payload is incomplete.");
    }

    const roomIds = new Set(rooms.map((room) => room.id));

    for (const roomId of validated.room_ids) {
      if (!roomIds.has(roomId)) {
        throw new Error("Room order payload contains unknown room.");
      }
    }

    return this.roomRepository.reorderRooms(validated.project_id, validated.room_ids);
  }

  async updateWorkflowType(input: UpdateProjectWorkflowTypeInput) {
    const validated = updateProjectWorkflowTypeSchema.parse(input);
    const existing = await this.repository.findByProjectId(validated.project_id);

    if (!existing) {
      throw new Error("Project was not found.");
    }

    const definition = buildDesignWorkflowForPackage(existing.project.package);

    await this.repository.updateWorkflowType(
      validated.project_id,
      validated.workflow_type,
      serializeHierarchicalWorkflow(definition)
    );

    await this.workflowEngineRepository.syncStageInstances(
      validated.project_id,
      definition
    );

    return {
      workflow_type: validated.workflow_type,
      workflow_groups: definition.groups,
    };
  }

  async updateWorkflowGroups(input: UpdateProjectWorkflowGroupsInput) {
    const validated = updateProjectWorkflowGroupsSchema.parse(input);
    const existing = await this.repository.findByProjectId(validated.project_id);

    if (!existing) {
      throw new Error("Project was not found.");
    }

    const groups = validated.groups
      .map(recalculateGroupHours)
      .map((group) => normalizeGroupDefinition(group));
    const definition = serializeHierarchicalWorkflow({
      version: 2,
      groups,
    });

    await this.repository.updateWorkflowDefinition(validated.project_id, definition);

    return groups;
  }

  static isValidationError(error: unknown): error is ZodError {
    return error instanceof ZodError;
  }

  static getValidationMessage(error: ZodError): string {
    return error.issues[0]?.message ?? bg.validation.failed;
  }
}
