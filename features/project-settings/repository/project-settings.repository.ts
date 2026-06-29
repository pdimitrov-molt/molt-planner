import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  Project,
  ProjectRow,
  ProjectWithClient,
} from "@/features/projects/types/project";
import {
  mapProjectRow,
  mapProjectWithClientRow,
} from "@/features/projects/types/project";
import type { ProjectSettingsRecord } from "@/features/project-settings/types/project-settings";
import type { ProjectWorkflowDefinition } from "@/features/project-settings/types/project-workflow-stage";
import type { HierarchicalWorkflowDefinition } from "@/features/workflow-engine/types/workflow-engine";
import {
  resolveWorkflowType,
} from "@/features/project-settings/lib/parse-workflow-definition";
import type { WorkflowType } from "@/features/project-settings/types/workflow-type";
import type {
  UpdateProjectGeneralSettingsInput,
  UpdateProjectClientSettingsInput,
  UpdateProjectPackageSettingsInput,
  UpdateProjectDeadlinesSettingsInput,
  UpdateProjectSettingsExtrasInput,
} from "@/features/project-settings/validation/project-settings.schema";
import {
  normalizeGeneralSettingsInput,
  normalizeDeadlinesSettingsInput,
} from "@/features/project-settings/validation/project-settings.schema";
import {
  parseProjectSettingsExtras,
  serializeProjectSettingsExtras,
} from "@/features/project-settings/lib/parse-settings-extras";

interface ProjectSettingsRow extends ProjectRow {
  workflow_type?: string | null;
  estimated_design_hours?: number | null;
  estimated_execution_hours?: number | null;
  workflow_definition?: unknown;
  settings_extras?: unknown;
}

export class ProjectSettingsRepository {
  constructor(private readonly database: SupabaseClient) {}

  private projectSelectQuery() {
    return this.database
      .from("projects")
      .select("*, clients(display_name)")
      .is("deleted_at", null);
  }

  async findByProjectId(projectId: string): Promise<ProjectSettingsRecord | null> {
    const { data, error } = await this.projectSelectQuery()
      .eq("id", projectId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    const row = data as ProjectSettingsRow;

    return {
      project: mapProjectWithClientRow(row),
      workflow_type: resolveWorkflowType(row.workflow_type),
      estimated_design_hours:
        row.estimated_design_hours === undefined ||
        row.estimated_design_hours === null
          ? null
          : Number(row.estimated_design_hours),
      estimated_execution_hours:
        row.estimated_execution_hours === undefined ||
        row.estimated_execution_hours === null
          ? null
          : Number(row.estimated_execution_hours),
      workflow_definition: row.workflow_definition ?? { stages: [] },
      settings_extras: parseProjectSettingsExtras(row.settings_extras),
    };
  }

  async updateGeneral(
    input: UpdateProjectGeneralSettingsInput
  ): Promise<ProjectWithClient> {
    const payload = normalizeGeneralSettingsInput(input);
    const timestamp = new Date().toISOString();

    const { data, error } = await this.database
      .from("projects")
      .update({
        name: payload.name,
        project_number: payload.project_number,
        category: payload.category,
        object_type: payload.object_type,
        site_address: payload.site_address,
        site_area: payload.site_area,
        engagement_status: payload.engagement_status,
        priority: payload.priority,
        updated_at: timestamp,
      })
      .eq("id", payload.project_id)
      .is("deleted_at", null)
      .select("*, clients(display_name)")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapProjectWithClientRow(data as ProjectRow);
  }

  async updateClient(
    input: UpdateProjectClientSettingsInput
  ): Promise<ProjectWithClient> {
    const timestamp = new Date().toISOString();

    const { data, error } = await this.database
      .from("projects")
      .update({
        client_id: input.client_id,
        updated_at: timestamp,
      })
      .eq("id", input.project_id)
      .is("deleted_at", null)
      .select("*, clients(display_name)")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapProjectWithClientRow(data as ProjectRow);
  }

  async updatePackage(
    input: UpdateProjectPackageSettingsInput
  ): Promise<ProjectWithClient> {
    const timestamp = new Date().toISOString();

    const { data, error } = await this.database
      .from("projects")
      .update({
        package: input.package,
        updated_at: timestamp,
      })
      .eq("id", input.project_id)
      .is("deleted_at", null)
      .select("*, clients(display_name)")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapProjectWithClientRow(data as ProjectRow);
  }

  async updateDeadlines(
    input: UpdateProjectDeadlinesSettingsInput
  ): Promise<Project> {
    const payload = normalizeDeadlinesSettingsInput(input);
    const timestamp = new Date().toISOString();

    const { data, error } = await this.database
      .from("projects")
      .update({
        design_deadline: payload.design_deadline,
        execution_deadline: payload.execution_deadline,
        move_in_date: payload.move_in_date,
        estimated_design_hours: payload.estimated_design_hours,
        estimated_execution_hours: payload.estimated_execution_hours,
        updated_at: timestamp,
      })
      .eq("id", payload.project_id)
      .is("deleted_at", null)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapProjectRow(data as ProjectRow);
  }

  async updateSettingsExtras(input: UpdateProjectSettingsExtrasInput): Promise<void> {
    const { error } = await this.database
      .from("projects")
      .update({
        settings_extras: serializeProjectSettingsExtras({
          team: input.team,
          document_templates: input.document_templates,
          files: input.files,
        }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.project_id)
      .is("deleted_at", null);

    if (error) {
      throw new Error(error.message);
    }
  }

  async updateSchedule(
    input: UpdateProjectDeadlinesSettingsInput
  ): Promise<Project> {
    return this.updateDeadlines(input);
  }

  async updateWorkflowType(
    projectId: string,
    workflowType: WorkflowType,
    workflowDefinition: HierarchicalWorkflowDefinition | ProjectWorkflowDefinition
  ): Promise<void> {
    const { error } = await this.database
      .from("projects")
      .update({
        workflow_type: workflowType,
        workflow_definition: workflowDefinition,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .is("deleted_at", null);

    if (error) {
      throw new Error(error.message);
    }
  }

  async updateWorkflowDefinition(
    projectId: string,
    workflowDefinition: HierarchicalWorkflowDefinition | ProjectWorkflowDefinition
  ): Promise<void> {
    const { error } = await this.database
      .from("projects")
      .update({
        workflow_definition: workflowDefinition,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .is("deleted_at", null);

    if (error) {
      throw new Error(error.message);
    }
  }

  async findProjectRooms(
    projectId: string
  ): Promise<Array<{ id: string; name: string }>> {
    const { data, error } = await this.database
      .from("rooms")
      .select("id, name")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  }
}
