import type { SupabaseClient } from "@supabase/supabase-js";

import { formatProjectNumber } from "@/features/projects/lib/project-number";
import type {
  Project,
  ProjectCategory,
  ProjectDetail,
  ProjectObjectType,
  ProjectPackage,
  ProjectRow,
  ProjectWithClient,
} from "@/features/projects/types/project";
import {
  mapProjectRow,
  mapProjectWithClientRow,
} from "@/features/projects/types/project";

export interface CreateProjectRecord {
  client_id: string;
  project_number: string;
  name: string;
  category: ProjectCategory;
  object_type: ProjectObjectType;
  package: ProjectPackage;
  site_address: string | null;
  site_area: number | null;
  engagement_status: string;
  priority: string;
  design_deadline: string | null;
  execution_deadline: string | null;
  move_in_date: string | null;
}

export class ProjectRepository {
  constructor(private readonly database: SupabaseClient) {}

  private projectSelectQuery() {
    return this.database
      .from("projects")
      .select("*, clients(display_name)")
      .is("deleted_at", null);
  }
  async getNextProjectNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const yearPrefix = String(year).slice(-2);
  
    const { data, error } = await this.database
      .from("projects")
      .select("project_number")
      .like("project_number", `${yearPrefix}%`)
      .is("deleted_at", null)
      .order("project_number", { ascending: false })
      .limit(1)
      .maybeSingle();
  
    if (error) {
      throw new Error(error.message);
    }
  
    let nextSequence = 1;
  
    if (data?.project_number) {
      const currentSequence = Number(data.project_number.substring(2));
  
      if (!Number.isNaN(currentSequence)) {
        nextSequence = currentSequence + 1;
      }
    }
  
    return formatProjectNumber(year, nextSequence);
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
      const { data: phaseData, error: phasesError } = await this.database
        .from("phases")
        .select("id, room_id, phase_kind, status, sort_order")
        .in("room_id", roomIds)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

      if (phasesError) {
        throw new Error(phasesError.message);
      }

      phaseRows = (phaseData ?? []) as PhaseRowWithRoom[];
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
      project_number: input.project_number,
      name: input.name,
      category: input.category,
      object_type: input.object_type,
      package: input.package,
      site_address: input.site_address,
      site_area: input.site_area,
      engagement_status: input.engagement_status,
      priority: input.priority,
      design_deadline: input.design_deadline,
      execution_deadline: input.execution_deadline,
      move_in_date: input.move_in_date,
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
