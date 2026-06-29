import { PhaseRepository } from "@/features/phases/repository/phase.repository";
import { ProgressRepository } from "@/features/progress/repository/progress.repository";
import {
  findNextIncompleteWorkflowInstance,
  isWorkflowProjectComplete,
} from "@/features/workflow-engine/lib/find-next-incomplete-workflow-instance";
import { WorkflowStageInstanceRepository } from "@/features/workflow-engine/repository/workflow-stage-instance.repository";
import { WorkSessionRepository } from "@/features/work-sessions/repository/work-session.repository";
import { sumCompletedSessionMinutes } from "@/features/work-sessions/lib/calculate-phase-work-stats";

export interface CompleteWorkflowStageInput {
  project_id: string;
  legacy_phase_id: string;
  move_to_next_stage: boolean;
}

export class WorkflowStageCompletionService {
  constructor(
    private readonly instanceRepository: WorkflowStageInstanceRepository,
    private readonly phaseRepository: PhaseRepository,
    private readonly workSessionRepository: WorkSessionRepository,
    private readonly progressRepository: ProgressRepository
  ) {}

  async completeStageFromLegacyPhase(input: CompleteWorkflowStageInput): Promise<void> {
    const instance = await this.instanceRepository.findByLegacyPhaseId(
      input.legacy_phase_id
    );

    if (!instance) {
      throw new Error("Workflow stage instance was not found.");
    }

    if (instance.project_id !== input.project_id) {
      throw new Error("Stage instance does not belong to this project.");
    }

    const sessions = await this.workSessionRepository.findByPhase(input.legacy_phase_id);
    const workedMinutes = sumCompletedSessionMinutes(sessions);
    const timestamp = new Date().toISOString();

    if (!input.move_to_next_stage) {
      await this.instanceRepository.update(instance.id, {
        worked_minutes: workedMinutes,
        last_activity_at: timestamp,
      });
      return;
    }

    if (instance.status === "completed") {
      throw new Error("This stage is already completed.");
    }

    const phase = await this.phaseRepository.findById(input.legacy_phase_id);

    if (phase && phase.status !== "completed") {
      await this.phaseRepository.completePhase(input.legacy_phase_id);
    }

    await this.instanceRepository.update(instance.id, {
      status: "completed",
      progress_percent: 100,
      completed_at: timestamp,
      last_activity_at: timestamp,
      worked_minutes: workedMinutes,
      started_at: instance.started_at ?? timestamp,
    });

    const instances = await this.instanceRepository.findByProject(input.project_id);
    const nextInstance = findNextIncompleteWorkflowInstance(instances, instance.id);

    if (nextInstance && nextInstance.status === "not_started") {
      await this.instanceRepository.update(nextInstance.id, {
        status: "in_progress",
        started_at: timestamp,
        last_activity_at: timestamp,
      });
    }

    await this.syncWorkflowProjectCompletion(input.project_id);
  }

  private async syncWorkflowProjectCompletion(projectId: string): Promise<void> {
    const instances = await this.instanceRepository.findByProject(projectId);

    if (!isWorkflowProjectComplete(instances)) {
      return;
    }

    const snapshot = await this.progressRepository.findProjectProgressSnapshot(projectId);

    if (!snapshot || snapshot.engagement_status === "completed") {
      return;
    }

    await this.progressRepository.updateProjectEngagementStatus(projectId, "completed");
  }
}
