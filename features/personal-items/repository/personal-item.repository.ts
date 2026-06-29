import type { SupabaseClient } from "@supabase/supabase-js";

import {
  type CreatePersonalItemInput,
  type PersonalItem,
  type PersonalItemRow,
  type PersonalItemUpdatePayload,
  type PersonalItemWritePayload,
  type UpdatePersonalItemInput,
  mapPersonalItemRow,
  normalizeCreatePersonalItemInput,
  normalizeUpdatePersonalItemInput,
} from "@/features/personal-items/types/personal-item";

export class PersonalItemRepository {
  constructor(private readonly database: SupabaseClient) {}

  async findAll(): Promise<PersonalItem[]> {
    const { data, error } = await this.database
      .from("personal_items")
      .select("*")
      .is("deleted_at", null)
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data as PersonalItemRow[]).map(mapPersonalItemRow);
  }

  async findById(itemId: string): Promise<PersonalItem | null> {
    const { data, error } = await this.database
      .from("personal_items")
      .select("*")
      .eq("id", itemId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return mapPersonalItemRow(data as PersonalItemRow);
  }

  async create(input: CreatePersonalItemInput): Promise<PersonalItem> {
    const timestamp = new Date().toISOString();
    const payload: PersonalItemWritePayload & {
      created_at: string;
      updated_at: string;
      deleted_at: null;
    } = {
      ...normalizeCreatePersonalItemInput(input),
      created_at: timestamp,
      updated_at: timestamp,
      deleted_at: null,
    };

    const { data, error } = await this.database
      .from("personal_items")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapPersonalItemRow(data as PersonalItemRow);
  }

  async update(input: UpdatePersonalItemInput): Promise<PersonalItem> {
    const timestamp = new Date().toISOString();
    const payload: PersonalItemUpdatePayload & { updated_at: string } = {
      ...normalizeUpdatePersonalItemInput(input),
      updated_at: timestamp,
    };

    const { data, error } = await this.database
      .from("personal_items")
      .update(payload)
      .eq("id", input.id)
      .is("deleted_at", null)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapPersonalItemRow(data as PersonalItemRow);
  }

  async softDelete(itemId: string): Promise<void> {
    const { error } = await this.database
      .from("personal_items")
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId)
      .is("deleted_at", null);

    if (error) {
      throw new Error(error.message);
    }
  }
}
