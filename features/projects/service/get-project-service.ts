import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProjectRepository } from "@/features/projects/repository/project.repository";
import { ProjectService } from "@/features/projects/service/project.service";

export async function getProjectService(): Promise<ProjectService> {
  const database = await createSupabaseServerClient();
  const repository = new ProjectRepository(database);

  return new ProjectService(repository);
}
