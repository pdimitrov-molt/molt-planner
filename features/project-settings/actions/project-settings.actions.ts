"use server";

import { revalidatePath } from "next/cache";

import { getProjectSettingsService } from "@/features/project-settings/service/get-project-settings-service";
import { ProjectSettingsService } from "@/features/project-settings/service/project-settings.service";
import type { Room } from "@/features/rooms/types/room";
import type { ProjectSettingsExtras } from "@/features/project-settings/types/project-settings-extras";
import type { WorkflowGroupDefinition } from "@/features/workflow-engine/types/workflow-engine";
import type {
  ArchiveProjectRoomSettingsInput,
  CreateProjectRoomSettingsInput,
  ReorderProjectRoomsSettingsInput,
  UpdateProjectClientSettingsInput,
  UpdateProjectDeadlinesSettingsInput,
  UpdateProjectGeneralSettingsInput,
  UpdateProjectPackageSettingsInput,
  UpdateProjectSettingsExtrasInput,
  UpdateProjectRoomSettingsInput,
  UpdateProjectScheduleSettingsInput,
  UpdateProjectWorkflowGroupsInput,
  UpdateProjectWorkflowTypeInput,
} from "@/features/project-settings/validation/project-settings.schema";
import type { WorkflowType } from "@/features/project-settings/types/workflow-type";
import { bg } from "@/src/i18n/bg";

export type ProjectSettingsActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function revalidateProjectSettings(projectId: string) {
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/settings`);
  revalidatePath("/");
  revalidatePath("/projects");
}

function handleError(error: unknown): ProjectSettingsActionResult<never> {
  if (ProjectSettingsService.isValidationError(error)) {
    return {
      success: false,
      error: ProjectSettingsService.getValidationMessage(error),
    };
  }

  return {
    success: false,
    error:
      error instanceof Error
        ? error.message
        : bg.projects.settings.errors.saveFailed,
  };
}

export async function updateProjectGeneralSettingsAction(
  input: UpdateProjectGeneralSettingsInput
): Promise<ProjectSettingsActionResult> {
  try {
    const service = await getProjectSettingsService();
    await service.updateGeneralSettings(input);
    revalidateProjectSettings(input.project_id);

    return { success: true, data: undefined };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateProjectClientSettingsAction(
  input: UpdateProjectClientSettingsInput
): Promise<ProjectSettingsActionResult> {
  try {
    const service = await getProjectSettingsService();
    await service.updateClientSettings(input);
    revalidateProjectSettings(input.project_id);

    return { success: true, data: undefined };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateProjectPackageSettingsAction(
  input: UpdateProjectPackageSettingsInput
): Promise<ProjectSettingsActionResult> {
  try {
    const service = await getProjectSettingsService();
    await service.updatePackageSettings(input);
    revalidateProjectSettings(input.project_id);

    return { success: true, data: undefined };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateProjectDeadlinesSettingsAction(
  input: UpdateProjectDeadlinesSettingsInput
): Promise<ProjectSettingsActionResult> {
  try {
    const service = await getProjectSettingsService();
    await service.updateDeadlinesSettings(input);
    revalidateProjectSettings(input.project_id);

    return { success: true, data: undefined };
  } catch (error) {
    return handleError(error);
  }
}

/** @deprecated Use updateProjectDeadlinesSettingsAction */
export async function updateProjectScheduleSettingsAction(
  input: UpdateProjectScheduleSettingsInput
): Promise<ProjectSettingsActionResult> {
  return updateProjectDeadlinesSettingsAction(input);
}

export async function updateProjectSettingsExtrasAction(
  input: UpdateProjectSettingsExtrasInput
): Promise<ProjectSettingsActionResult<ProjectSettingsExtras>> {
  try {
    const service = await getProjectSettingsService();
    const result = await service.updateSettingsExtras(input);
    revalidateProjectSettings(input.project_id);

    return {
      success: true,
      data: {
        team: result.team,
        document_templates: result.document_templates,
        files: result.files,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function createProjectRoomSettingsAction(
  input: CreateProjectRoomSettingsInput
): Promise<ProjectSettingsActionResult<Room>> {
  try {
    const service = await getProjectSettingsService();
    const room = await service.createRoom(input);
    revalidateProjectSettings(input.project_id);

    return { success: true, data: room };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateProjectRoomSettingsAction(
  input: UpdateProjectRoomSettingsInput
): Promise<ProjectSettingsActionResult<Room>> {
  try {
    const service = await getProjectSettingsService();
    const room = await service.updateRoom(input);
    revalidateProjectSettings(input.project_id);

    return { success: true, data: room };
  } catch (error) {
    return handleError(error);
  }
}

export async function archiveProjectRoomSettingsAction(
  input: ArchiveProjectRoomSettingsInput
): Promise<ProjectSettingsActionResult> {
  try {
    const service = await getProjectSettingsService();
    await service.archiveRoom(input);
    revalidateProjectSettings(input.project_id);

    return { success: true, data: undefined };
  } catch (error) {
    return handleError(error);
  }
}

export async function reorderProjectRoomsSettingsAction(
  input: ReorderProjectRoomsSettingsInput
): Promise<ProjectSettingsActionResult<Room[]>> {
  try {
    const service = await getProjectSettingsService();
    const rooms = await service.reorderRooms(input);
    revalidateProjectSettings(input.project_id);

    return { success: true, data: rooms };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateProjectWorkflowTypeAction(
  input: UpdateProjectWorkflowTypeInput
): Promise<
  ProjectSettingsActionResult<{
    workflow_type: WorkflowType;
    workflow_groups: WorkflowGroupDefinition[];
  }>
> {
  try {
    const service = await getProjectSettingsService();
    const result = await service.updateWorkflowType(input);
    revalidateProjectSettings(input.project_id);

    return { success: true, data: result };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateProjectWorkflowGroupsAction(
  input: UpdateProjectWorkflowGroupsInput
): Promise<ProjectSettingsActionResult<WorkflowGroupDefinition[]>> {
  try {
    const service = await getProjectSettingsService();
    const groups = await service.updateWorkflowGroups(input);
    revalidateProjectSettings(input.project_id);

    return { success: true, data: groups };
  } catch (error) {
    return handleError(error);
  }
}
