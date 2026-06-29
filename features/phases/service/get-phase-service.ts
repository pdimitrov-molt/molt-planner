import { PhaseRepository } from "@/features/phases/repository/phase.repository";
import { PhaseService } from "@/features/phases/service/phase.service";
import { ProgressRepository } from "@/features/progress/repository/progress.repository";
import { ProgressService } from "@/features/progress/service/progress.service";
import { RoomRepository } from "@/features/rooms/repository/room.repository";
import { getCachedSupabaseServerClient } from "@/lib/server/request-cache";

export async function getPhaseService(): Promise<PhaseService> {
  const database = await getCachedSupabaseServerClient();
  const progressService = new ProgressService(new ProgressRepository(database));

  return new PhaseService(
    new PhaseRepository(database),
    new RoomRepository(database),
    progressService
  );
}
