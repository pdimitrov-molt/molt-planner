import { PhaseRepository } from "@/features/phases/repository/phase.repository";
import { PhaseService } from "@/features/phases/service/phase.service";
import { RoomRepository } from "@/features/rooms/repository/room.repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getPhaseService(): Promise<PhaseService> {
  const database = await createSupabaseServerClient();

  return new PhaseService(
    new PhaseRepository(database),
    new RoomRepository(database)
  );
}
