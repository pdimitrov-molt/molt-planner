import { cache } from "react";

import { ProjectRepository } from "@/features/projects/repository/project.repository";
import { ProjectService } from "@/features/projects/service/project.service";
import { getCachedSupabaseServiceClient } from "@/lib/server/request-cache";

export const getProjectService = cache(async (): Promise<ProjectService> => {
  const database = getCachedSupabaseServiceClient();

  return new ProjectService(new ProjectRepository(database));
});
