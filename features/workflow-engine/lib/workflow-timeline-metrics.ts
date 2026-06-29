import type { WorkflowWaitingEvent } from "@/features/workflow-engine/types/workflow-waiting-event";
import type {
  StageWorkData,
  WorkflowGroupView,
  WorkflowStageView,
} from "@/features/workflow-engine/types/workflow-engine";

export type TimelineStageState = "completed" | "current" | "waiting" | "upcoming";

export interface GroupWorkMetrics {
  estimated_hours: number;
  worked_hours: number;
  remaining_hours: number;
}

export function resolveTimelineStageState(
  stage: WorkflowStageView,
  activeWaiting: WorkflowWaitingEvent | null = null
): TimelineStageState {
  if (stage.status === "completed" || stage.progress_percent >= 100) {
    return "completed";
  }

  if (stage.is_current) {
    return activeWaiting ? "waiting" : "current";
  }

  return "upcoming";
}

export function aggregateStageWorkMetrics(work: StageWorkData | undefined): GroupWorkMetrics {
  if (!work) {
    return { estimated_hours: 0, worked_hours: 0, remaining_hours: 0 };
  }

  const instances = Object.values(work.instances);

  if (instances.length === 0) {
    return {
      estimated_hours: work.stats.estimated_hours,
      worked_hours: work.stats.worked_hours,
      remaining_hours: work.stats.remaining_hours,
    };
  }

  return instances.reduce<GroupWorkMetrics>(
    (totals, instance) => ({
      estimated_hours: totals.estimated_hours + instance.stats.estimated_hours,
      worked_hours: totals.worked_hours + instance.stats.worked_hours,
      remaining_hours: totals.remaining_hours + instance.stats.remaining_hours,
    }),
    { estimated_hours: 0, worked_hours: 0, remaining_hours: 0 }
  );
}

export function aggregateGroupWorkMetrics(
  group: WorkflowGroupView,
  stageWorkData: Record<string, StageWorkData>
): GroupWorkMetrics {
  return group.stages
    .filter((stage) => stage.enabled)
    .reduce<GroupWorkMetrics>(
      (totals, stage) => {
        const stageMetrics = aggregateStageWorkMetrics(stageWorkData[stage.id]);

        return {
          estimated_hours: totals.estimated_hours + stageMetrics.estimated_hours,
          worked_hours: totals.worked_hours + stageMetrics.worked_hours,
          remaining_hours: totals.remaining_hours + stageMetrics.remaining_hours,
        };
      },
      { estimated_hours: 0, worked_hours: 0, remaining_hours: 0 }
    );
}

export function findCurrentStageName(group: WorkflowGroupView): string | null {
  const currentStage = group.stages.find((stage) => stage.is_current && stage.enabled);

  if (currentStage) {
    return currentStage.name;
  }

  const firstActive = group.stages.find(
    (stage) => stage.enabled && stage.status !== "completed"
  );

  return firstActive?.name ?? null;
}
