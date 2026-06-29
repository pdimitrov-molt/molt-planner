import type { PhaseKind, PhaseStatus } from "@/features/phases/types/phase";
import { isPhaseStatus } from "@/features/phases/types/phase";
import type {
  WorkflowStageInstance,
  WorkflowStageInstanceRow,
  WorkflowStageInstanceType,
} from "@/features/workflow-engine/types/workflow-engine";

function mapStageInstanceRow(row: WorkflowStageInstanceRow): WorkflowStageInstance {
  if (!isPhaseStatus(row.status)) {
    throw new Error(`Invalid stage instance status: ${row.status}`);
  }

  return {
    id: row.id,
    project_id: row.project_id,
    group_key: row.group_key,
    stage_key: row.stage_key,
    group_name: row.group_name,
    stage_name: row.stage_name,
    execution_mode: row.execution_mode as WorkflowStageInstance["execution_mode"],
    instance_type: row.instance_type as WorkflowStageInstanceType,
    room_id: row.room_id,
    document_key: row.document_key,
    assigned_user_id: row.assigned_user_id,
    status: row.status,
    estimated_minutes: row.estimated_minutes,
    worked_minutes: row.worked_minutes,
    progress_percent: row.progress_percent,
    started_at: row.started_at,
    completed_at: row.completed_at,
    last_activity_at: row.last_activity_at,
    sort_order: row.sort_order,
    enabled: row.enabled,
    legacy_phase_id: row.legacy_phase_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    deleted_at: row.deleted_at,
  };
}

export interface InsertWorkflowStageInstanceInput {
  project_id: string;
  group_key: string;
  stage_key: string;
  group_name: string;
  stage_name: string;
  execution_mode: WorkflowStageInstance["execution_mode"];
  instance_type: WorkflowStageInstanceType;
  room_id: string | null;
  document_key: string | null;
  assigned_user_id?: string | null;
  status?: PhaseStatus;
  estimated_minutes: number;
  worked_minutes?: number;
  progress_percent?: number;
  started_at?: string | null;
  completed_at?: string | null;
  last_activity_at?: string | null;
  sort_order: number;
  enabled: boolean;
  legacy_phase_id?: string | null;
}

export interface UpdateWorkflowStageInstanceInput {
  group_key?: string;
  stage_key?: string;
  group_name?: string;
  stage_name?: string;
  execution_mode?: WorkflowStageInstance["execution_mode"];
  instance_type?: WorkflowStageInstanceType;
  assigned_user_id?: string | null;
  status?: PhaseStatus;
  estimated_minutes?: number;
  worked_minutes?: number;
  progress_percent?: number;
  started_at?: string | null;
  completed_at?: string | null;
  last_activity_at?: string | null;
  sort_order?: number;
  enabled?: boolean;
  legacy_phase_id?: string | null;
}

export class WorkflowStageInstanceRepository {
  constructor(private readonly database: import("@supabase/supabase-js").SupabaseClient) {}

  async findByProject(projectId: string): Promise<WorkflowStageInstance[]> {
    const { data, error } = await this.database
      .from("workflow_stage_instances")
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data as WorkflowStageInstanceRow[]).map(mapStageInstanceRow);
  }

  async findByLegacyPhaseId(legacyPhaseId: string): Promise<WorkflowStageInstance | null> {
    const { data, error } = await this.database
      .from("workflow_stage_instances")
      .select("*")
      .eq("legacy_phase_id", legacyPhaseId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return mapStageInstanceRow(data as WorkflowStageInstanceRow);
  }

  async insert(input: InsertWorkflowStageInstanceInput): Promise<WorkflowStageInstance> {
    const timestamp = new Date().toISOString();

    const { data, error } = await this.database
      .from("workflow_stage_instances")
      .insert({
        project_id: input.project_id,
        group_key: input.group_key,
        stage_key: input.stage_key,
        group_name: input.group_name,
        stage_name: input.stage_name,
        execution_mode: input.execution_mode,
        instance_type: input.instance_type,
        room_id: input.room_id,
        document_key: input.document_key,
        assigned_user_id: input.assigned_user_id ?? null,
        status: input.status ?? "not_started",
        estimated_minutes: input.estimated_minutes,
        worked_minutes: input.worked_minutes ?? 0,
        progress_percent: input.progress_percent ?? 0,
        started_at: input.started_at ?? null,
        completed_at: input.completed_at ?? null,
        last_activity_at: input.last_activity_at ?? null,
        sort_order: input.sort_order,
        enabled: input.enabled,
        legacy_phase_id: input.legacy_phase_id ?? null,
        created_at: timestamp,
        updated_at: timestamp,
        deleted_at: null,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapStageInstanceRow(data as WorkflowStageInstanceRow);
  }

  async update(
    instanceId: string,
    patch: UpdateWorkflowStageInstanceInput
  ): Promise<WorkflowStageInstance> {
    const { data, error } = await this.database
      .from("workflow_stage_instances")
      .update({
        ...patch,
        updated_at: new Date().toISOString(),
      })
      .eq("id", instanceId)
      .is("deleted_at", null)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapStageInstanceRow(data as WorkflowStageInstanceRow);
  }

  async softDelete(instanceIds: string[]): Promise<void> {
    if (instanceIds.length === 0) {
      return;
    }

    const timestamp = new Date().toISOString();
    const { error } = await this.database
      .from("workflow_stage_instances")
      .update({
        deleted_at: timestamp,
        updated_at: timestamp,
      })
      .in("id", instanceIds)
      .is("deleted_at", null);

    if (error) {
      throw new Error(error.message);
    }
  }

  async createLegacyWorkflowPhase(input: {
    room_id: string;
    phase_kind: PhaseKind;
    estimated_hours: number;
    sort_order: number;
    status?: PhaseStatus;
  }): Promise<string> {
    const timestamp = new Date().toISOString();

    const { data, error } = await this.database
      .from("phases")
      .insert({
        room_id: input.room_id,
        phase_kind: input.phase_kind,
        status: input.status ?? "not_started",
        estimated_hours: input.estimated_hours,
        target_start_date: null,
        target_end_date: null,
        completed_at: null,
        blocker_reason: null,
        sort_order: input.sort_order,
        is_workflow_instance: true,
        created_at: timestamp,
        updated_at: timestamp,
        deleted_at: null,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data.id as string;
  }
}
