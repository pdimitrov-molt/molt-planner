import type { SupabaseClient } from "@supabase/supabase-js";

import type { Room, RoomRow } from "@/features/rooms/types/room";
import { mapRoomRow } from "@/features/rooms/types/room";
import type { WizardRoomInput } from "@/features/rooms/validation/room.schema";
import { normalizeWizardRoomInput } from "@/features/rooms/validation/room.schema";

export interface CreateRoomRecord extends ReturnType<typeof normalizeWizardRoomInput> {
  project_id: string;
}

export class RoomRepository {
  constructor(private readonly database: SupabaseClient) {}

  async findByProjectId(projectId: string): Promise<Room[]> {
    const { data, error } = await this.database
      .from("rooms")
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data as RoomRow[]).map(mapRoomRow);
  }

  async createMany(inputs: CreateRoomRecord[]): Promise<Room[]> {
    const timestamp = new Date().toISOString();
    const payload = inputs.map((input) => ({
      project_id: input.project_id,
      room_template_key: input.room_template_key,
      name: input.name,
      room_kind: input.room_kind,
      scope_summary: input.scope_summary,
      priority: input.priority,
      current_phase_id: null,
      sort_order: input.sort_order,
      created_at: timestamp,
      updated_at: timestamp,
      deleted_at: null,
    }));

    const { data, error } = await this.database
      .from("rooms")
      .insert(payload)
      .select("*");

    if (error) {
      throw new Error(error.message);
    }

    return (data as RoomRow[]).map(mapRoomRow);
  }

  async updateCurrentPhase(roomId: string, phaseId: string): Promise<void> {
    const { error } = await this.database
      .from("rooms")
      .update({
        current_phase_id: phaseId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", roomId)
      .is("deleted_at", null);

    if (error) {
      throw new Error(error.message);
    }
  }

  async deleteByProjectId(projectId: string): Promise<void> {
    const { error } = await this.database
      .from("rooms")
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("project_id", projectId)
      .is("deleted_at", null);

    if (error) {
      throw new Error(error.message);
    }
  }

  async createRoom(input: CreateRoomRecord): Promise<Room> {
    const timestamp = new Date().toISOString();
    const payload = {
      project_id: input.project_id,
      room_template_key: input.room_template_key,
      name: input.name,
      room_kind: input.room_kind,
      scope_summary: input.scope_summary,
      priority: input.priority,
      current_phase_id: null,
      sort_order: input.sort_order,
      created_at: timestamp,
      updated_at: timestamp,
      deleted_at: null,
    };

    const { data, error } = await this.database
      .from("rooms")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapRoomRow(data as RoomRow);
  }

  async updateRoom(
    roomId: string,
    patch: { name?: string; sort_order?: number }
  ): Promise<Room> {
    const { data, error } = await this.database
      .from("rooms")
      .update({
        ...patch,
        updated_at: new Date().toISOString(),
      })
      .eq("id", roomId)
      .is("deleted_at", null)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapRoomRow(data as RoomRow);
  }

  async archiveRoom(roomId: string): Promise<void> {
    const { error } = await this.database
      .from("rooms")
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", roomId)
      .is("deleted_at", null);

    if (error) {
      throw new Error(error.message);
    }
  }

  async reorderRooms(projectId: string, roomIds: string[]): Promise<Room[]> {
    const timestamp = new Date().toISOString();

    await Promise.all(
      roomIds.map((roomId, index) =>
        this.database
          .from("rooms")
          .update({ sort_order: index, updated_at: timestamp })
          .eq("id", roomId)
          .eq("project_id", projectId)
          .is("deleted_at", null)
      )
    );

    return this.findByProjectId(projectId);
  }

  static buildCreateRecords(
    projectId: string,
    rooms: WizardRoomInput[]
  ): CreateRoomRecord[] {
    return rooms.map((room, index) => ({
      project_id: projectId,
      ...normalizeWizardRoomInput({
        ...room,
        sort_order: room.sort_order ?? index,
      }),
    }));
  }
}
