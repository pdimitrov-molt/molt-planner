import { ClientRepository } from "@/features/clients/repository/client.repository";
import { ClientService } from "@/features/clients/service/client.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getClientService(): Promise<ClientService> {
  const database = await createSupabaseServerClient();
  return new ClientService(new ClientRepository(database));
}
