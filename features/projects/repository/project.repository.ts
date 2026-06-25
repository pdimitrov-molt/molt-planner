import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  Project,
  ProjectDetail,
  ProjectRow,
  ProjectType,
  ProjectWithClient,
} from "@/features/projects/types/project";
import {
  mapProjectRow,
  mapProjectWithClientRow,
} from "@/features/projects/types/project";
import type { CreateProjectInput } from "@/features/projects/validation/project.schema";

export interface CreateProjectRecord {
  client_id: string;
  name: string;
  project_type: ProjectType;
  site_address: string | null;
  site_area: number | null;
  engagement_status: string;
  priority: string;
}

export class ProjectRepository {
  constructor(private readonly database: SupabaseClient) {}

  private projectSelectQuery() {
    return this.database
      .from("projects")
      .select("*, clients(display_name)")
      .is("deleted_at", null);
  }

  async findAllWithClient(): Promise<ProjectWithClient[]> {
    const { data, error } = await this.projectSelectQuery().order("created_at", {
      ascending: false,
    });

    if (error) {
      throw new Error(error.message);
    }

    return (data as ProjectRow[]).map(mapProjectWithClientRow);
  }

  async findById(projectId: string): Promise<Project | null> {
    const { data, error } = await this.projectSelectQuery()
      .eq("id", projectId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return mapProjectRow(data as ProjectRow);
  }

  async findDetailById(projectId: string): Promise<ProjectDetail | null> {
    const { data, error } = await this.projectSelectQuery()
      .eq("id", projectId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    const project = mapProjectWithClientRow(data as ProjectRow);

    const { data: rooms, error: roomsError } = await this.database
      .from("rooms")
      .select("id, name, room_kind, scope_summary, priority, current_phase_id, sort_order")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (roomsError) {
      throw new Error(roomsError.message);
    }

    const roomIds = (rooms ?? []).map((room) => room.id);
    type PhaseRowWithRoom = {
      id: string;
      room_id: string;
      phase_kind: string;
      status: string;
      sort_order: number;
    };

    let phaseRows: PhaseRowWithRoom[] = [];

    if (roomIds.length > 0) {
      const { data, error: phasesError } = await this.database
        .from("phases")
        .select("id, room_id, phase_kind, status, sort_order")
        .in("room_id", roomIds)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

      if (phasesError) {
        throw new Error(phasesError.message);
      }

      phaseRows = (data ?? []) as PhaseRowWithRoom[];
    }

    return {
      ...project,
      rooms: (rooms ?? []).map((room) => ({
        id: room.id,
        name: room.name,
        room_kind: room.room_kind,
        scope_summary: room.scope_summary,
        priority: room.priority,
        current_phase_id: room.current_phase_id,
        sort_order: room.sort_order,
        phases: phaseRows
          .filter((phase) => phase.room_id === room.id)
          .map(({ id, phase_kind, status, sort_order }) => ({
            id,
            phase_kind,
            status,
            sort_order,
          })),
      })),
    };
  }

  async create(input: CreateProjectRecord): Promise<Project> {
    const timestamp = new Date().toISOString();
    const payload = {
      client_id: input.client_id,
      name: input.name,
      project_type: input.project_type,
      site_address: input.site_address,
      site_area: input.site_area,
      engagement_status: input.engagement_status,
      priority: input.priority,
      created_at: timestamp,
      updated_at: timestamp,
      deleted_at: null,
    };

    const { data, error } = await this.database
      .from("projects")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapProjectRow(data as ProjectRow);
  }

  async softDelete(projectId: string): Promise<void> {
    const { error } = await this.database
      .from("projects")
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .is("deleted_at", null);

    if (error) {
      throw new Error(error.message);
    }
  }
}
