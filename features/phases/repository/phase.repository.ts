import type { SupabaseClient } from "@supabase/supabase-js";

import { getPhaseTemplateEstimatedHours } from "@/features/phases/data/phase-templates";
import {
  DEFAULT_PHASE_SEQUENCE,
  type Phase,
  type PhaseRow,
} from "@/features/phases/types/phase";
import { mapPhaseRow } from "@/features/phases/types/phase";

export class PhaseRepository {
  constructor(private readonly database: SupabaseClient) {}

  async findByRoomIds(roomIds: string[]): Promise<Phase[]> {
    if (roomIds.length === 0) {
      return [];
    }

    const { data, error } = await this.database
      .from("phases")
      .select("*")
      .in("room_id", roomIds)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data as PhaseRow[]).map(mapPhaseRow);
  }

  async findById(phaseId: string): Promise<Phase | null> {
    const { data, error } = await this.database
      .from("phases")
      .select("*")
      .eq("id", phaseId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return mapPhaseRow(data as PhaseRow);
  }

  async createDefaultPhasesForRooms(roomIds: string[]): Promise<Phase[]> {
    const timestamp = new Date().toISOString();
    const payload = roomIds.flatMap((roomId) =>
      DEFAULT_PHASE_SEQUENCE.map((phaseKind, index) => ({
        room_id: roomId,
        phase_kind: phaseKind,
        status: index === 0 ? "in_progress" : "not_started",
        estimated_hours: getPhaseTemplateEstimatedHours(phaseKind),
        target_start_date: null,
        target_end_date: null,
        completed_at: null,
        blocker_reason: null,
        sort_order: index,
        created_at: timestamp,
        updated_at: timestamp,
        deleted_at: null,
      }))
    );

    const { data, error } = await this.database
      .from("phases")
      .insert(payload)
      .select("*");

    if (error) {
      throw new Error(error.message);
    }

    return (data as PhaseRow[]).map(mapPhaseRow);
  }

  async completePhase(phaseId: string): Promise<Phase> {
    const phase = await this.findById(phaseId);

    if (!phase) {
      throw new Error("Phase was not found.");
    }

    const timestamp = new Date().toISOString();

    const { error: completeError } = await this.database
      .from("phases")
      .update({
        status: "completed",
        completed_at: timestamp,
        updated_at: timestamp,
        blocker_reason: null,
      })
      .eq("id", phaseId)
      .is("deleted_at", null);

    if (completeError) {
      throw new Error(completeError.message);
    }

    if (phase.is_workflow_instance) {
      const updatedPhase = await this.findById(phaseId);

      if (!updatedPhase) {
        throw new Error("Completed phase could not be loaded.");
      }

      return updatedPhase;
    }

    const { data: roomPhases, error: roomPhasesError } = await this.database
      .from("phases")
      .select("*")
      .eq("room_id", phase.room_id)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (roomPhasesError) {
      throw new Error(roomPhasesError.message);
    }

    const nextPhase = (roomPhases as PhaseRow[]).find(
      (entry) =>
        entry.sort_order > phase.sort_order && entry.status !== "completed"
    );

    if (nextPhase) {
      const { error: activateError } = await this.database
        .from("phases")
        .update({
          status: "in_progress",
          updated_at: timestamp,
        })
        .eq("id", nextPhase.id)
        .is("deleted_at", null);

      if (activateError) {
        throw new Error(activateError.message);
      }

      const { error: roomError } = await this.database
        .from("rooms")
        .update({
          current_phase_id: nextPhase.id,
          updated_at: timestamp,
        })
        .eq("id", phase.room_id)
        .is("deleted_at", null);

      if (roomError) {
        throw new Error(roomError.message);
      }
    }

    const updatedPhase = await this.findById(phaseId);

    if (!updatedPhase) {
      throw new Error("Completed phase could not be loaded.");
    }

    return updatedPhase;
  }

  async deleteByRoomIds(roomIds: string[]): Promise<void> {
    if (roomIds.length === 0) {
      return;
    }

    const { error } = await this.database
      .from("phases")
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .in("room_id", roomIds)
      .is("deleted_at", null);

    if (error) {
      throw new Error(error.message);
    }
  }
}
