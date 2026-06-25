import type { SupabaseClient } from "@supabase/supabase-js";

import { type Task, type TaskRow, mapTaskRow } from "@/features/tasks/types/task";

export class TaskRepository {
  constructor(private readonly database: SupabaseClient) {}

  async findByProjectId(projectId: string): Promise<Task[]> {
    const { data, error } = await this.database
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("scheduled_date", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data as TaskRow[]).map(mapTaskRow);
  }

  async findScheduledForProjectOnDate(
    projectId: string,
    date: string
  ): Promise<Task[]> {
    const { data, error } = await this.database
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .eq("scheduled_date", date)
      .is("deleted_at", null)
      .order("estimated_hours", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data as TaskRow[]).map(mapTaskRow);
  }
}
