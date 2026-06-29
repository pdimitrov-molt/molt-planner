import type { SupabaseClient } from "@supabase/supabase-js";

import {
  mapWorkflowWaitingEventRow,
  type WorkflowWaitingEvent,
  type WorkflowWaitingEventRow,
  type WorkflowWaitingReason,
} from "@/features/workflow-engine/types/workflow-waiting-event";

export interface CreateWorkflowWaitingEventInput {
  project_id: string;
  workflow_instance_id: string;
  reason: WorkflowWaitingReason;
  custom_reason?: string | null;
  expected_end_at?: string | null;
  notes?: string | null;
  started_at?: string;
}

export class WorkflowWaitingRepository {
  constructor(private readonly database: SupabaseClient) {}

  async findWorkflowInstanceProject(
    workflowInstanceId: string
  ): Promise<{ project_id: string } | null> {
    const { data, error } = await this.database
      .from("workflow_stage_instances")
      .select("project_id")
      .eq("id", workflowInstanceId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return { project_id: data.project_id as string };
  }

  async create(input: CreateWorkflowWaitingEventInput): Promise<WorkflowWaitingEvent> {
    const timestamp = new Date().toISOString();

    const { data, error } = await this.database
      .from("workflow_waiting_events")
      .insert({
        project_id: input.project_id,
        workflow_instance_id: input.workflow_instance_id,
        reason: input.reason,
        custom_reason: input.custom_reason ?? null,
        started_at: input.started_at ?? timestamp,
        expected_end_at: input.expected_end_at ?? null,
        ended_at: null,
        status: "ACTIVE",
        notes: input.notes ?? null,
        created_at: timestamp,
        updated_at: timestamp,
        deleted_at: null,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapWorkflowWaitingEventRow(data as WorkflowWaitingEventRow);
  }

  async finish(eventId: string): Promise<WorkflowWaitingEvent> {
    const timestamp = new Date().toISOString();

    const { data, error } = await this.database
      .from("workflow_waiting_events")
      .update({
        status: "COMPLETED",
        ended_at: timestamp,
        updated_at: timestamp,
      })
      .eq("id", eventId)
      .eq("status", "ACTIVE")
      .is("deleted_at", null)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Active waiting event was not found.");
    }

    return mapWorkflowWaitingEventRow(data as WorkflowWaitingEventRow);
  }

  async cancel(eventId: string): Promise<WorkflowWaitingEvent> {
    const timestamp = new Date().toISOString();

    const { data, error } = await this.database
      .from("workflow_waiting_events")
      .update({
        status: "CANCELLED",
        ended_at: timestamp,
        updated_at: timestamp,
      })
      .eq("id", eventId)
      .eq("status", "ACTIVE")
      .is("deleted_at", null)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Active waiting event was not found.");
    }

    return mapWorkflowWaitingEventRow(data as WorkflowWaitingEventRow);
  }

  async findAllActive(): Promise<WorkflowWaitingEvent[]> {
    const { data, error } = await this.database
      .from("workflow_waiting_events")
      .select("*")
      .eq("status", "ACTIVE")
      .is("deleted_at", null)
      .order("started_at", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data as WorkflowWaitingEventRow[]).map(mapWorkflowWaitingEventRow);
  }

  async findActive(workflowInstanceId: string): Promise<WorkflowWaitingEvent | null> {
    const { data, error } = await this.database
      .from("workflow_waiting_events")
      .select("*")
      .eq("workflow_instance_id", workflowInstanceId)
      .eq("status", "ACTIVE")
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return mapWorkflowWaitingEventRow(data as WorkflowWaitingEventRow);
  }

  async findHistory(workflowInstanceId: string): Promise<WorkflowWaitingEvent[]> {
    const { data, error } = await this.database
      .from("workflow_waiting_events")
      .select("*")
      .eq("workflow_instance_id", workflowInstanceId)
      .is("deleted_at", null)
      .order("started_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data as WorkflowWaitingEventRow[]).map(mapWorkflowWaitingEventRow);
  }
}
