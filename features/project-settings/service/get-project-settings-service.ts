import { getCachedSupabaseServiceClient } from "@/lib/server/request-cache";
import { RoomRepository } from "@/features/rooms/repository/room.repository";
import { ProjectSettingsRepository } from "@/features/project-settings/repository/project-settings.repository";
import { ProjectSettingsService } from "@/features/project-settings/service/project-settings.service";
import { WorkflowEngineRepository } from "@/features/workflow-engine/repository/workflow-engine.repository";

export async function getProjectSettingsService(): Promise<ProjectSettingsService> {
  const database = getCachedSupabaseServiceClient();

  return new ProjectSettingsService(
    new ProjectSettingsRepository(database),
    new WorkflowEngineRepository(database),
    new RoomRepository(database)
  );
}
