import { cache } from "react";

import { WorkSessionRepository } from "@/features/work-sessions/repository/work-session.repository";
import { WorkSessionService } from "@/features/work-sessions/service/work-session.service";
import { getCachedSupabaseServerClient } from "@/lib/server/request-cache";

export const getWorkSessionService = cache(async (): Promise<WorkSessionService> => {
  const database = await getCachedSupabaseServerClient();
  return new WorkSessionService(new WorkSessionRepository(database));
});
