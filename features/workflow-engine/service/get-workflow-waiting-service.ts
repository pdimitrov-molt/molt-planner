import { cache } from "react";

import { WorkflowWaitingRepository } from "@/features/workflow-engine/repository/workflow-waiting.repository";
import { WorkflowWaitingService } from "@/features/workflow-engine/service/workflow-waiting.service";
import { getCachedSupabaseServiceClient } from "@/lib/server/request-cache";

export const getWorkflowWaitingRepository = cache(async (): Promise<WorkflowWaitingRepository> => {
  const database = getCachedSupabaseServiceClient();
  return new WorkflowWaitingRepository(database);
});

export const getWorkflowWaitingService = cache(async (): Promise<WorkflowWaitingService> => {
  const repository = await getWorkflowWaitingRepository();
  return new WorkflowWaitingService(repository);
});
