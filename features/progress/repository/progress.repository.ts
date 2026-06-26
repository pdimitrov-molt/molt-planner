import type { SupabaseClient } from "@supabase/supabase-js";

import { isPhaseStatus } from "@/features/phases/types/phase";
import {
  isEngagementStatus,
  type EngagementStatus,
} from "@/features/projects/types/project";
import type {
  PhaseProgressSnapshot,
  ProjectProgressSnapshot,
  RoomProgressSnapshot,
} from "@/features/progress/types/progress";

interface ProgressPhaseRow {
  status: string;
  completed_at: string | null;
}

interface ProgressRoomRow {
  id: string;
  phases: ProgressPhaseRow[] | null;
}

interface ProgressProjectRow {
  id: string;
  engagement_status: string;
  rooms: ProgressRoomRow[] | null;
}

function mapPhaseSnapshot(phase: ProgressPhaseRow): PhaseProgressSnapshot {
  if (!isPhaseStatus(phase.status)) {
    throw new Error(`Invalid phase status: ${phase.status}`);
  }

  return {
    status: phase.status,
    completed_at: phase.completed_at,
  };
}

function mapRoomSnapshot(room: ProgressRoomRow): RoomProgressSnapshot {
  return {
    id: room.id,
    phases: (room.phases ?? []).map(mapPhaseSnapshot),
  };
}

function mapProjectSnapshot(project: ProgressProjectRow): ProjectProgressSnapshot {
  if (!isEngagementStatus(project.engagement_status)) {
    throw new Error(`Invalid engagement status: ${project.engagement_status}`);
  }

  return {
    id: project.id,
    engagement_status: project.engagement_status,
    rooms: (project.rooms ?? []).map(mapRoomSnapshot),
  };
}

export class ProgressRepository {
  constructor(private readonly database: SupabaseClient) {}

  async findStudioProgressSnapshot(): Promise<ProjectProgressSnapshot[]> {
    const { data, error } = await this.database
      .from("projects")
      .select(
        `
        id,
        engagement_status,
        rooms (
          id,
          phases (
            status,
            completed_at
          )
        )
      `
      )
      .is("deleted_at", null)
      .neq("engagement_status", "archived")
      .is("rooms.deleted_at", null)
      .is("rooms.phases.deleted_at", null);

    if (error) {
      throw new Error(error.message);
    }

    return ((data ?? []) as ProgressProjectRow[]).map(mapProjectSnapshot);
  }

  async findProjectProgressSnapshot(
    projectId: string
  ): Promise<ProjectProgressSnapshot | null> {
    const { data, error } = await this.database
      .from("projects")
      .select(
        `
        id,
        engagement_status,
        rooms (
          id,
          phases (
            status,
            completed_at
          )
        )
      `
      )
      .eq("id", projectId)
      .is("deleted_at", null)
      .is("rooms.deleted_at", null)
      .is("rooms.phases.deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return mapProjectSnapshot(data as ProgressProjectRow);
  }

  async updateProjectEngagementStatus(
    projectId: string,
    engagementStatus: EngagementStatus
  ): Promise<void> {
    const { error } = await this.database
      .from("projects")
      .update({
        engagement_status: engagementStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .is("deleted_at", null);

    if (error) {
      throw new Error(error.message);
    }
  }
}
