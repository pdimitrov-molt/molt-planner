import { getActivePhaseSession } from "@/features/work-sessions/lib/get-active-phase-session";
import { calculatePhaseWorkStats } from "@/features/work-sessions/lib/calculate-phase-work-stats";
import {
  findWorkSessionsByPhaseId,
  getPhaseWorkSessionHistory,
} from "@/features/work-sessions/service/cached-work-session-queries";
import type { WorkSessionService } from "@/features/work-sessions/service/work-session.service";
import {
  getCurrentWaitingForInstance,
  getWaitingHistoryForInstance,
} from "@/features/workflow-engine/service/cached-waiting-queries";
import type { WorkflowWaitingService } from "@/features/workflow-engine/service/workflow-waiting.service";
import { itemTypeFromExecutionMode, minutesToEstimatedHours } from "@/features/workflow-engine/lib/workflow-execution-mode";
import type {
  StageInstanceWorkData,
  StageWorkData,
  WorkflowStageInstanceView,
  WorkflowStageView,
} from "@/features/workflow-engine/types/workflow-engine";

function buildStatsFromInstance(input: {
  estimated_minutes: number;
  worked_minutes: number;
}): StageInstanceWorkData["stats"] {
  const estimated_hours = minutesToEstimatedHours(input.estimated_minutes);
  const worked_hours = Math.round((input.worked_minutes / 60) * 10) / 10;
  const remaining_hours = Math.max(
    0,
    Math.round((estimated_hours - worked_hours) * 10) / 10
  );

  return {
    estimated_hours,
    worked_hours,
    remaining_hours,
    variance_hours: Math.round((worked_hours - estimated_hours) * 10) / 10,
    worked_minutes: input.worked_minutes,
  };
}

async function loadTimerSessions(timerTargetId: string | null): Promise<
  Pick<StageInstanceWorkData, "activeSession" | "history"> & {
    sessions: Awaited<ReturnType<typeof findWorkSessionsByPhaseId>>;
  }
> {
  if (!timerTargetId) {
    return {
      activeSession: null,
      history: [],
      sessions: [],
    };
  }

  const [sessions, history] = await Promise.all([
    findWorkSessionsByPhaseId(timerTargetId),
    getPhaseWorkSessionHistory(timerTargetId),
  ]);

  return {
    activeSession: getActivePhaseSession(sessions),
    history,
    sessions,
  };
}

async function loadInstanceWorkData(
  instance: WorkflowStageInstanceView,
  _workSessionService: WorkSessionService,
  _waitingService: WorkflowWaitingService
): Promise<StageInstanceWorkData> {
  const timerTargetId = instance.timer_target_id;
  const [timerSessions, activeWaiting, waitingHistory] = await Promise.all([
    loadTimerSessions(timerTargetId),
    getCurrentWaitingForInstance(instance.id),
    getWaitingHistoryForInstance(instance.id),
  ]);

  const baseStats = buildStatsFromInstance({
    estimated_minutes: instance.estimated_minutes,
    worked_minutes: instance.worked_minutes,
  });

  if (!timerTargetId) {
    return {
      instance_id: instance.id,
      timer_target_id: null,
      document_item_name: instance.document_item_name,
      activeSession: timerSessions.activeSession,
      history: timerSessions.history,
      stats: baseStats,
      activeWaiting,
      waitingHistory,
    };
  }

  const sessionStats = calculatePhaseWorkStats({
    estimated_hours: baseStats.estimated_hours,
    sessions: timerSessions.sessions,
  });

  return {
    instance_id: instance.id,
    timer_target_id: timerTargetId,
    document_item_name: instance.document_item_name,
    activeSession: timerSessions.activeSession,
    history: timerSessions.history,
    stats: {
      ...baseStats,
      worked_hours: sessionStats.worked_hours,
      worked_minutes: sessionStats.worked_minutes,
      remaining_hours: sessionStats.remaining_hours,
      variance_hours: sessionStats.variance_hours,
    },
    activeWaiting,
    waitingHistory,
  };
}

function pickPrimaryInstance(stage: WorkflowStageView): WorkflowStageInstanceView | null {
  return (
    stage.instances.find((instance) => instance.is_current) ??
    stage.instances.find((instance) => instance.status === "in_progress") ??
    stage.instances.find((instance) => instance.progress_percent < 100) ??
    stage.instances[0] ??
    null
  );
}

export async function loadStageWorkData(
  stage: WorkflowStageView,
  workSessionService: WorkSessionService,
  waitingService: WorkflowWaitingService
): Promise<StageWorkData> {
  const itemType = itemTypeFromExecutionMode(stage.execution_mode);
  const instances: StageWorkData["instances"] = {};

  await Promise.all(
    stage.instances.map(async (instance) => {
      instances[instance.id] = await loadInstanceWorkData(
        instance,
        workSessionService,
        waitingService
      );
    })
  );

  const primaryInstance = pickPrimaryInstance(stage);
  const primaryWork = primaryInstance ? instances[primaryInstance.id] : null;

  return {
    item_type: itemType,
    execution_mode: stage.execution_mode,
    activeSession: primaryWork?.activeSession ?? null,
    history: primaryWork?.history ?? [],
    stats:
      primaryWork?.stats ??
      buildStatsFromInstance({
        estimated_minutes: Math.round(stage.estimated_hours * 60),
        worked_minutes: 0,
      }),
    instances,
  };
}
