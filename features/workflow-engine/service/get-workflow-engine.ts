import { cache } from "react";

import { WorkflowEngineRepository } from "@/features/workflow-engine/repository/workflow-engine.repository";
import type { ProjectWorkflowEngineView } from "@/features/workflow-engine/types/workflow-engine";
import { getCachedSupabaseServiceClient } from "@/lib/server/request-cache";

export const getWorkflowEngineRepository = cache(async (): Promise<WorkflowEngineRepository> => {
  const database = getCachedSupabaseServiceClient();
  return new WorkflowEngineRepository(database);
});

export const getProjectWorkflowEngineView = cache(
  async (projectId: string): Promise<ProjectWorkflowEngineView | null> => {
    const repository = await getWorkflowEngineRepository();
    return repository.findProjectWorkflowView(projectId);
  }
);

export async function loadProjectWorkflowMap(
  projectIds: readonly string[]
): Promise<Map<string, ProjectWorkflowEngineView>> {
  const entries = await Promise.all(
    projectIds.map(async (projectId) => {
      const workflow = await getProjectWorkflowEngineView(projectId);
      return [projectId, workflow] as const;
    })
  );

  return new Map(
    entries.filter(
      (entry): entry is [string, ProjectWorkflowEngineView] => entry[1] !== null
    )
  );
}
