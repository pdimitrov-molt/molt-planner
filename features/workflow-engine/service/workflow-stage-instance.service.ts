import type { PhaseStatus } from "@/features/phases/types/phase";
import type {
  UpdateWorkflowStageInstanceInput,
  WorkflowStageInstanceRepository,
} from "@/features/workflow-engine/repository/workflow-stage-instance.repository";
import { WorkflowStageInstanceSyncService } from "@/features/workflow-engine/service/workflow-stage-instance-sync.service";
import type {
  HierarchicalWorkflowDefinition,
  WorkflowStageInstance,
} from "@/features/workflow-engine/types/workflow-engine";

export class WorkflowStageInstanceService {
  private readonly syncService: WorkflowStageInstanceSyncService;

  constructor(private readonly repository: WorkflowStageInstanceRepository) {
    this.syncService = new WorkflowStageInstanceSyncService(repository);
  }

  findByProject(projectId: string): Promise<WorkflowStageInstance[]> {
    return this.repository.findByProject(projectId);
  }

  sync(input: {
    project_id: string;
    definition: HierarchicalWorkflowDefinition;
    rooms: Array<{ id: string; name: string }>;
  }): Promise<WorkflowStageInstance[]> {
    return this.syncService.sync(input);
  }

  updateInstance(
    instanceId: string,
    patch: UpdateWorkflowStageInstanceInput
  ): Promise<WorkflowStageInstance> {
    return this.repository.update(instanceId, patch);
  }

  updateProgress(input: {
    instanceId: string;
    status?: PhaseStatus;
    worked_minutes?: number;
    progress_percent?: number;
    started_at?: string | null;
    completed_at?: string | null;
    last_activity_at?: string | null;
  }): Promise<WorkflowStageInstance> {
    return this.repository.update(input.instanceId, {
      status: input.status,
      worked_minutes: input.worked_minutes,
      progress_percent: input.progress_percent,
      started_at: input.started_at,
      completed_at: input.completed_at,
      last_activity_at: input.last_activity_at ?? new Date().toISOString(),
    });
  }

  softDelete(instanceIds: string[]): Promise<void> {
    return this.repository.softDelete(instanceIds);
  }
}
