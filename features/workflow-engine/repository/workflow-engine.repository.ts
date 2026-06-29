import type { SupabaseClient } from "@supabase/supabase-js";

import { buildProjectWorkflowEngineView } from "@/features/workflow-engine/lib/build-project-workflow-engine-view";
import {
  hasPersistedHierarchicalWorkflow,
  parseHierarchicalWorkflow,
  serializeHierarchicalWorkflow,
} from "@/features/workflow-engine/lib/parse-hierarchical-workflow";
import {
  migrateWorkflowDefinitionForPackage,
  needsWorkflowDefinitionMigration,
} from "@/features/workflow-engine/lib/workflow-definition-migration";
import {
  DEFAULT_PROJECT_PACKAGE,
  isProjectPackage,
  type ProjectPackage,
} from "@/features/projects/types/project";
import { WorkflowStageInstanceRepository } from "@/features/workflow-engine/repository/workflow-stage-instance.repository";
import { WorkflowStageInstanceSyncService } from "@/features/workflow-engine/service/workflow-stage-instance-sync.service";
import type { ProjectWorkflowEngineView } from "@/features/workflow-engine/types/workflow-engine";

function resolveProjectPackage(packageValue: string | null | undefined): ProjectPackage {
  if (packageValue && isProjectPackage(packageValue)) {
    return packageValue;
  }

  return DEFAULT_PROJECT_PACKAGE;
}

export class WorkflowEngineRepository {
  private readonly instanceSync: WorkflowStageInstanceSyncService;

  constructor(private readonly database: SupabaseClient) {
    this.instanceSync = new WorkflowStageInstanceSyncService(
      new WorkflowStageInstanceRepository(database)
    );
  }

  async findProjectWorkflowView(projectId: string): Promise<ProjectWorkflowEngineView | null> {
    const { data: project, error: projectError } = await this.database
      .from("projects")
      .select("id, workflow_definition, package")
      .eq("id", projectId)
      .is("deleted_at", null)
      .maybeSingle();

    if (projectError) {
      throw new Error(projectError.message);
    }

    if (!project) {
      return null;
    }

    const projectPackage = resolveProjectPackage(project.package as string | null | undefined);
    let definition = parseHierarchicalWorkflow(project.workflow_definition);
    const shouldMigrate =
      !hasPersistedHierarchicalWorkflow(project.workflow_definition) ||
      needsWorkflowDefinitionMigration(definition);

    if (shouldMigrate) {
      definition = migrateWorkflowDefinitionForPackage(projectPackage);
      await this.database
        .from("projects")
        .update({
          workflow_definition: serializeHierarchicalWorkflow(definition),
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId)
        .is("deleted_at", null);
    }

    const { data: rooms, error: roomsError } = await this.database
      .from("rooms")
      .select("id, name")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (roomsError) {
      throw new Error(roomsError.message);
    }

    const roomList = rooms ?? [];
    const instances = await this.instanceSync.sync({
      project_id: projectId,
      definition,
      rooms: roomList,
    });

    return buildProjectWorkflowEngineView({
      project_id: projectId,
      definition,
      rooms: roomList,
      instances,
    });
  }

  async saveWorkflowDefinition(
    projectId: string,
    definition: ReturnType<typeof serializeHierarchicalWorkflow>
  ): Promise<void> {
    const { error } = await this.database
      .from("projects")
      .update({
        workflow_definition: serializeHierarchicalWorkflow(definition),
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .is("deleted_at", null);

    if (error) {
      throw new Error(error.message);
    }
  }

  async syncStageInstances(
    projectId: string,
    definition: ReturnType<typeof serializeHierarchicalWorkflow>
  ): Promise<void> {
    const { data: rooms, error } = await this.database
      .from("rooms")
      .select("id, name")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    await this.instanceSync.sync({
      project_id: projectId,
      definition,
      rooms: rooms ?? [],
    });
  }
}
