import type { SupabaseClient } from "@supabase/supabase-js";

import type { Client, ClientRow } from "@/features/clients/types/client";
import { mapClientRow } from "@/features/clients/types/client";
import type { CreateClientInput } from "@/features/clients/validation/client.schema";
import { normalizeCreateClientInput } from "@/features/clients/validation/client.schema";

export class ClientRepository {
  constructor(private readonly database: SupabaseClient) {}

  async findAll(): Promise<Client[]> {
    const { data, error } = await this.database
      .from("clients")
      .select("*")
      .is("deleted_at", null)
      .order("display_name", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data as ClientRow[]).map(mapClientRow);
  }

  async findById(clientId: string): Promise<Client | null> {
    const { data, error } = await this.database
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return mapClientRow(data as ClientRow);
  }

  async create(input: CreateClientInput): Promise<Client> {
    const timestamp = new Date().toISOString();
    const payload = {
      ...normalizeCreateClientInput(input),
      created_at: timestamp,
      updated_at: timestamp,
      deleted_at: null,
    };

    const { data, error } = await this.database
      .from("clients")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapClientRow(data as ClientRow);
  }

  async softDelete(clientId: string): Promise<void> {
    const { error } = await this.database
      .from("clients")
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", clientId)
      .is("deleted_at", null);

    if (error) {
      throw new Error(error.message);
    }
  }
}
