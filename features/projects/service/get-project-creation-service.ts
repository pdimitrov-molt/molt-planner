import { ClientRepository } from "@/features/clients/repository/client.repository";
import { PhaseRepository } from "@/features/phases/repository/phase.repository";
import { ProjectRepository } from "@/features/projects/repository/project.repository";
import { ProjectCreationService } from "@/features/projects/service/project-creation.service";
import { RoomRepository } from "@/features/rooms/repository/room.repository";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function getProjectCreationService(): Promise<ProjectCreationService> {
  const database = createSupabaseServiceClient();

  return new ProjectCreationService(
    new ClientRepository(database),
    new ProjectRepository(database),
    new RoomRepository(database),
    new PhaseRepository(database)
  );
}