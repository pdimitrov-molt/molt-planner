import type { SupabaseClient } from "@supabase/supabase-js";

import { getPhaseTemplateEstimatedHours } from "@/features/phases/data/phase-templates";
import {
  isPhaseKind,
  isPhaseStatus,
  PHASE_KIND_LABELS,
  type PhaseStatus,
} from "@/features/phases/types/phase";
import { mapRoomRow, type RoomRow } from "@/features/rooms/types/room";
import { ROOM_KIND_LABELS, type RoomKind } from "@/features/rooms/types/room";

export interface RoomWorkspacePhase {
  id: string;
  label: string;
  status: PhaseStatus;
  is_current: boolean;
  blocker_reason: string | null;
  estimated_hours: number;
}

export interface RoomWorkspace {
  id: string;
  project_id: string;
  project_name: string;
  name: string;
  room_kind_label: string;
  scope_summary: string | null;
  progress_percent: number;
  current_phase_label: string;
  phases: RoomWorkspacePhase[];
}

export class RoomWorkspaceRepository {
  constructor(private readonly database: SupabaseClient) {}

  async findRoomWorkspace(
    projectId: string,
    roomId: string
  ): Promise<RoomWorkspace | null> {
    const { data: project, error: projectError } = await this.database
      .from("projects")
      .select("id, name")
      .eq("id", projectId)
      .is("deleted_at", null)
      .maybeSingle();

    if (projectError) {
      throw new Error(projectError.message);
    }

    if (!project) {
      return null;
    }

    const { data: room, error: roomError } = await this.database
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .maybeSingle();

    if (roomError) {
      throw new Error(roomError.message);
    }

    if (!room) {
      return null;
    }

    const mappedRoom = mapRoomRow(room as RoomRow);

    const { data: phases, error: phasesError } = await this.database
      .from("phases")
      .select("id, phase_kind, status, estimated_hours, blocker_reason, sort_order")
      .eq("room_id", roomId)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (phasesError) {
      throw new Error(phasesError.message);
    }

    const workspacePhases = (phases ?? []).map((phase) => {
      if (!isPhaseKind(phase.phase_kind)) {
        throw new Error(`Invalid phase kind: ${phase.phase_kind}`);
      }

      if (!isPhaseStatus(phase.status)) {
        throw new Error(`Invalid phase status: ${phase.status}`);
      }

      return {
        id: phase.id,
        label: PHASE_KIND_LABELS[phase.phase_kind],
        status: phase.status,
        is_current: phase.id === mappedRoom.current_phase_id,
        blocker_reason: phase.blocker_reason,
        estimated_hours:
          phase.estimated_hours ??
          getPhaseTemplateEstimatedHours(phase.phase_kind),
      };
    });

    const completedCount = workspacePhases.filter(
      (phase) => phase.status === "completed"
    ).length;
    const progressPercent =
      workspacePhases.length === 0
        ? 0
        : Math.round((completedCount / workspacePhases.length) * 100);

    const currentPhase = workspacePhases.find((phase) => phase.is_current);

    return {
      id: mappedRoom.id,
      project_id: project.id,
      project_name: project.name,
      name: mappedRoom.name,
      room_kind_label:
        ROOM_KIND_LABELS[mappedRoom.room_kind as RoomKind] ?? mappedRoom.room_kind,
      scope_summary: mappedRoom.scope_summary,
      progress_percent: progressPercent,
      current_phase_label: currentPhase?.label ?? "",
      phases: workspacePhases,
    };
  }
}
