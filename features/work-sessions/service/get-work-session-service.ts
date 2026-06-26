import { WorkSessionRepository } from "@/features/work-sessions/repository/work-session.repository";
import { WorkSessionService } from "@/features/work-sessions/service/work-session.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getWorkSessionService(): Promise<WorkSessionService> {
  const database = await createSupabaseServerClient();
  return new WorkSessionService(new WorkSessionRepository(database));
}
