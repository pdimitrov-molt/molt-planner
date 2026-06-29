import "server-only";

import { cache } from "react";

import { getWorkflowWaitingService } from "@/features/workflow-engine/service/get-workflow-waiting-service";

export const getCurrentWaitingForInstance = cache(async (workflowInstanceId: string) => {
  const service = await getWorkflowWaitingService();
  return service.getCurrentWaiting({ workflow_instance_id: workflowInstanceId });
});

export const getWaitingHistoryForInstance = cache(async (workflowInstanceId: string) => {
  const service = await getWorkflowWaitingService();
  return service.getWaitingHistory(workflowInstanceId);
});
