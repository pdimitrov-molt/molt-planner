import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { ProjectRepository } from "@/features/projects/repository/project.repository";
import { ProjectService } from "@/features/projects/service/project.service";

export async function getProjectService(): Promise<ProjectService> {
  const database = createSupabaseServiceClient();

  return new ProjectService(
    new ProjectRepository(database)
  );
}