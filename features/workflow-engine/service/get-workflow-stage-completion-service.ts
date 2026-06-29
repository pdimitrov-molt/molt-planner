import { PhaseRepository } from "@/features/phases/repository/phase.repository";
import { ProgressRepository } from "@/features/progress/repository/progress.repository";
import { WorkflowStageInstanceRepository } from "@/features/workflow-engine/repository/workflow-stage-instance.repository";
import { WorkflowStageCompletionService } from "@/features/workflow-engine/service/workflow-stage-completion.service";
import { WorkSessionRepository } from "@/features/work-sessions/repository/work-session.repository";
import { getCachedSupabaseServerClient } from "@/lib/server/request-cache";

export async function getWorkflowStageCompletionService(): Promise<WorkflowStageCompletionService> {
  const database = await getCachedSupabaseServerClient();

  return new WorkflowStageCompletionService(
    new WorkflowStageInstanceRepository(database),
    new PhaseRepository(database),
    new WorkSessionRepository(database),
    new ProgressRepository(database)
  );
}
