"use server";

import { getClientService } from "@/features/clients/service/get-client-service";
import { ClientService } from "@/features/clients/service/client.service";
import type { Client } from "@/features/clients/types/client";

export type ClientActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function listClientsAction(): Promise<ClientActionResult<Client[]>> {
  try {
    const service = await getClientService();
    const clients = await service.listClients();
    return { success: true, data: clients };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load clients.",
    };
  }
}

export async function createClientAction(
  input: Parameters<ClientService["createClient"]>[0]
): Promise<ClientActionResult<Client>> {
  try {
    const service = await getClientService();
    const client = await service.createClient(input);
    return { success: true, data: client };
  } catch (error) {
    if (ClientService.isValidationError(error)) {
      return {
        success: false,
        error: ClientService.getValidationMessage(error),
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create client.",
    };
  }
}
