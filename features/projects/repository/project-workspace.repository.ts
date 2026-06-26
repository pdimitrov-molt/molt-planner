import type { SupabaseClient } from "@supabase/supabase-js";
import { format } from "date-fns";

import {
  isEngagementStatus,
  isProjectPriority,
  mapProjectWithClientRow,
  type ProjectRow,
} from "@/features/projects/types/project";
import { buildProjectWorkspace } from "@/features/projects/lib/build-project-workspace";
import type {
  ProjectWorkspace,
  WorkspaceSourceProject,
  WorkspaceSourceRoom,
} from "@/features/projects/types/project-workspace";
import { isPhaseKind, isPhaseStatus } from "@/features/phases/types/phase";
import { TaskRepository } from "@/features/tasks/repository/task.repository";

export class ProjectWorkspaceRepository {
  private readonly taskRepository: TaskRepository;

  constructor(private readonly database: SupabaseClient) {
    this.taskRepository = new TaskRepository(database);
  }

  async findWorkspaceByProjectId(projectId: string): Promise<ProjectWorkspace | null> {
    const { data, error } = await this.database
      .from("projects")
      .select("*, clients(display_name)")
      .eq("id", projectId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    const project = mapProjectWithClientRow(data as ProjectRow);
    const rooms = await this.loadRooms(projectId);
    const tasks = await this.taskRepository.findByProjectId(projectId);
    const todayIsoDate = format(new Date(), "yyyy-MM-dd");

    if (!isEngagementStatus(project.engagement_status)) {
      throw new Error("Invalid engagement status.");
    }

    if (!isProjectPriority(project.priority)) {
      throw new Error("Invalid project priority.");
    }

    const source: WorkspaceSourceProject = {
      id: project.id,
      project_number: project.project_number,
      name: project.name,
      client_display_name: project.client_display_name,
      category: project.category,
      object_type: project.object_type,
      package: project.package,
      site_area: project.site_area,
      engagement_status: project.engagement_status,
      priority: project.priority,
      design_deadline: project.design_deadline,
      execution_deadline: project.execution_deadline,
      move_in_date: project.move_in_date,
      rooms,
      tasks: tasks.map((task) => ({
        id: task.id,
        room_id: task.room_id,
        phase_id: task.phase_id,
        title: task.title,
        task_kind: task.task_kind,
        status: task.status,
        estimated_hours: task.estimated_hours,
        scheduled_date: task.scheduled_date,
        blocked_reason: task.blocked_reason,
      })),
    };

    return buildProjectWorkspace(source, todayIsoDate);
  }

  private async loadRooms(projectId: string): Promise<WorkspaceSourceRoom[]> {
    const { data: rooms, error: roomsError } = await this.database
      .from("rooms")
      .select("id, name, room_kind, priority, current_phase_id, sort_order")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (roomsError) {
      throw new Error(roomsError.message);
    }

    const roomIds = (rooms ?? []).map((room) => room.id);

    if (roomIds.length === 0) {
      return [];
    }

    const { data: phases, error: phasesError } = await this.database
      .from("phases")
      .select(
        "id, room_id, phase_kind, status, estimated_hours, blocker_reason, target_end_date, sort_order"
      )
      .in("room_id", roomIds)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (phasesError) {
      throw new Error(phasesError.message);
    }

    return (rooms ?? []).map((room) => ({
      id: room.id,
      name: room.name,
      room_kind: room.room_kind,
      priority: room.priority,
      current_phase_id: room.current_phase_id,
      sort_order: room.sort_order,
      phases: (phases ?? [])
        .filter((phase) => phase.room_id === room.id)
        .map((phase) => {
          if (!isPhaseKind(phase.phase_kind)) {
            throw new Error(`Invalid phase kind: ${phase.phase_kind}`);
          }

          if (!isPhaseStatus(phase.status)) {
            throw new Error(`Invalid phase status: ${phase.status}`);
          }

          return {
            id: phase.id,
            room_id: phase.room_id,
            phase_kind: phase.phase_kind,
            status: phase.status,
            estimated_hours: phase.estimated_hours,
            blocker_reason: phase.blocker_reason,
            target_end_date: phase.target_end_date,
            sort_order: phase.sort_order,
          };
        }),
    }));
  }
}
