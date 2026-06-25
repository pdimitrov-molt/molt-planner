import { ProjectWorkspaceRepository } from "@/features/projects/repository/project-workspace.repository";
import type { ProjectWorkspace } from "@/features/projects/types/project-workspace";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export class ProjectWorkspaceService {
  constructor(private readonly repository: ProjectWorkspaceRepository) {}

  async getProjectWorkspace(projectId: string): Promise<ProjectWorkspace | null> {
    return this.repository.findWorkspaceByProjectId(projectId);
  }
}

export async function getProjectWorkspaceService(): Promise<ProjectWorkspaceService> {
  const database = await createSupabaseServerClient();
  return new ProjectWorkspaceService(new ProjectWorkspaceRepository(database));
}
