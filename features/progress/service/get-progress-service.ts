import { ProgressRepository } from "@/features/progress/repository/progress.repository";
import { ProgressService } from "@/features/progress/service/progress.service";
import { getCachedSupabaseServerClient } from "@/lib/server/request-cache";

export async function getProgressService(): Promise<ProgressService> {
  const database = await getCachedSupabaseServerClient();
  return new ProgressService(new ProgressRepository(database));
}
