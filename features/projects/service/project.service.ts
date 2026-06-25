import { ZodError } from "zod";

import { ProjectRepository } from "@/features/projects/repository/project.repository";
import type {
  ProjectDetail,
  ProjectWithClient,
} from "@/features/projects/types/project";
import {
  deleteProjectSchema,
  type DeleteProjectInput,
} from "@/features/projects/validation/project.schema";
import { bg } from "@/src/i18n/bg";

export class ProjectService {
  constructor(private readonly repository: ProjectRepository) {}

  async listProjectsWithClient(): Promise<ProjectWithClient[]> {
    return this.repository.findAllWithClient();
  }

  async getProjectDetail(projectId: string): Promise<ProjectDetail | null> {
    return this.repository.findDetailById(projectId);
  }

  async archiveProject(input: DeleteProjectInput): Promise<void> {
    const validatedInput = deleteProjectSchema.parse(input);
    const existingProject = await this.repository.findById(validatedInput.id);

    if (!existingProject) {
      throw new Error("Project was not found.");
    }

    await this.repository.softDelete(validatedInput.id);
  }

  static isValidationError(error: unknown): error is ZodError {
    return error instanceof ZodError;
  }

  static getValidationMessage(error: ZodError): string {
    return error.issues[0]?.message ?? bg.validation.failed;
  }
}
