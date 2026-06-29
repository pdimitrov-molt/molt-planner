import { cache } from "react";

import { ProjectWorkspaceRepository } from "@/features/projects/repository/project-workspace.repository";
import type { ProjectWorkspace } from "@/features/projects/types/project-workspace";
import { getCachedSupabaseServerClient } from "@/lib/server/request-cache";

export class ProjectWorkspaceService {
  constructor(private readonly repository: ProjectWorkspaceRepository) {}

  async getProjectWorkspace(projectId: string): Promise<ProjectWorkspace | null> {
    return this.repository.findWorkspaceByProjectId(projectId);
  }
}

export const getProjectWorkspaceService = cache(async (): Promise<ProjectWorkspaceService> => {
  const database = await getCachedSupabaseServerClient();
  return new ProjectWorkspaceService(new ProjectWorkspaceRepository(database));
});

export const getProjectWorkspace = cache(async (projectId: string): Promise<ProjectWorkspace | null> => {
  const service = await getProjectWorkspaceService();
  return service.getProjectWorkspace(projectId);
});

export async function loadProjectWorkspaces(
  projectIds: readonly string[]
): Promise<ProjectWorkspace[]> {
  const results = await Promise.all(
    projectIds.map((projectId) => getProjectWorkspace(projectId))
  );

  return results.filter((workspace): workspace is ProjectWorkspace => workspace !== null);
}
