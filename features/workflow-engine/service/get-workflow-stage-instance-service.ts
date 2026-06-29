import { cache } from "react";

import { WorkflowStageInstanceRepository } from "@/features/workflow-engine/repository/workflow-stage-instance.repository";
import { WorkflowStageInstanceService } from "@/features/workflow-engine/service/workflow-stage-instance.service";
import { WorkflowStageInstanceSyncService } from "@/features/workflow-engine/service/workflow-stage-instance-sync.service";
import { getCachedSupabaseServiceClient } from "@/lib/server/request-cache";

export const getWorkflowStageInstanceRepository = cache(
  async (): Promise<WorkflowStageInstanceRepository> => {
    const database = getCachedSupabaseServiceClient();
    return new WorkflowStageInstanceRepository(database);
  }
);

export const getWorkflowStageInstanceService = cache(
  async (): Promise<WorkflowStageInstanceService> => {
    const repository = await getWorkflowStageInstanceRepository();
    return new WorkflowStageInstanceService(repository);
  }
);

export const getWorkflowStageInstanceSyncService = cache(
  async (): Promise<WorkflowStageInstanceSyncService> => {
    const repository = await getWorkflowStageInstanceRepository();
    return new WorkflowStageInstanceSyncService(repository);
  }
);

/** @deprecated Use getWorkflowStageInstanceSyncService */
export async function getStageInstanceSyncService(): Promise<WorkflowStageInstanceSyncService> {
  return getWorkflowStageInstanceSyncService();
}
