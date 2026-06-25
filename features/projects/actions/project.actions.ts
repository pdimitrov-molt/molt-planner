"use server";

import { revalidatePath } from "next/cache";

import { getProjectCreationService } from "@/features/projects/service/get-project-creation-service";
import { getProjectService } from "@/features/projects/service/get-project-service";
import { ProjectCreationService } from "@/features/projects/service/project-creation.service";
import { ProjectService } from "@/features/projects/service/project.service";
import type {
  ProjectActionResult,
  ProjectMutationResult,
} from "@/features/projects/types/action-result";
import type { Project } from "@/features/projects/types/project";
import {
  formatValidationErrors,
  type ProjectWizardInput,
} from "@/features/projects/validation/project-wizard.schema";
import type { DeleteProjectInput } from "@/features/projects/validation/project.schema";
import { bg } from "@/src/i18n/bg";

function handleWizardError(error: unknown): ProjectMutationResult {
  if (ProjectCreationService.isValidationError(error)) {
    return {
      success: false,
      error: ProjectCreationService.getValidationMessage(error),
      fieldErrors: formatValidationErrors(error),
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: false,
    error: bg.errors.createProject,
  };
}

export async function createProjectWizardAction(
  input: ProjectWizardInput
): Promise<ProjectMutationResult> {
  try {
    const service = await getProjectCreationService();
    const project = await service.createProjectFromWizard(input);

    revalidatePath("/");
    revalidatePath("/projects/new");

    return {
      success: true,
      data: project,
    };
  } catch (error) {
    return handleWizardError(error);
  }
}

export async function archiveProjectAction(
  input: DeleteProjectInput
): Promise<ProjectActionResult> {
  try {
    const service = await getProjectService();
    await service.archiveProject(input);

    revalidatePath("/");
    revalidatePath(`/projects/${input.id}`);

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    if (ProjectService.isValidationError(error)) {
      return {
        success: false,
        error: ProjectService.getValidationMessage(error),
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : bg.errors.archiveProject,
    };
  }
}
