import type { Project } from "@/features/projects/types/project";

export type ProjectActionResult<T = void> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };

export type ProjectListResult = ProjectActionResult<Project[]>;
export type ProjectMutationResult = ProjectActionResult<Project>;
