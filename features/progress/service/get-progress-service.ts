import { ProgressRepository } from "@/features/progress/repository/progress.repository";
import { ProgressService } from "@/features/progress/service/progress.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getProgressService(): Promise<ProgressService> {
  const database = await createSupabaseServerClient();
  return new ProgressService(new ProgressRepository(database));
}
