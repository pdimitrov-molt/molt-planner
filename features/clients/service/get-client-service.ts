import { ClientRepository } from "@/features/clients/repository/client.repository";
import { ClientService } from "@/features/clients/service/client.service";
import { getCachedSupabaseServerClient } from "@/lib/server/request-cache";

export async function getClientService(): Promise<ClientService> {
  const database = await getCachedSupabaseServerClient();
  return new ClientService(new ClientRepository(database));
}
