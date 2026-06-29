import { StageWorkPanel } from "@/features/work-sessions/components/stage-work-panel";
import type { PhaseWorkStats } from "@/features/work-sessions/lib/calculate-phase-work-stats";
import type { PhaseWorkSessionHistoryEntry } from "@/features/work-sessions/types/work-session-log";
import type { WorkSession } from "@/features/work-sessions/types/work-session";
import type { WorkflowWaitingEvent } from "@/features/workflow-engine/types/workflow-waiting-event";

interface WorkflowStageWorkPanelProps {
  projectId: string;
  workflowInstanceId: string;
  roomId: string | null;
  timerTargetId: string;
  stageName: string;
  roomName: string | null;
  scopeLabel?: string;
  progressPercent: number;
  stats: PhaseWorkStats;
  history: PhaseWorkSessionHistoryEntry[];
  activeSession: WorkSession | null;
  runningSession: WorkSession | null;
  activeWaiting: WorkflowWaitingEvent | null;
  waitingHistory: WorkflowWaitingEvent[];
  canCompleteStage?: boolean;
}

export function WorkflowStageWorkPanel({
  projectId,
  workflowInstanceId,
  roomId,
  timerTargetId,
  stageName,
  roomName,
  scopeLabel,
  progressPercent,
  stats,
  history,
  activeSession,
  runningSession,
  activeWaiting,
  waitingHistory,
  canCompleteStage = true,
}: WorkflowStageWorkPanelProps) {
  return (
    <StageWorkPanel
      projectId={projectId}
      workflowInstanceId={workflowInstanceId}
      roomId={roomId}
      phaseId={timerTargetId}
      stageName={stageName}
      roomName={roomName}
      scopeLabel={scopeLabel}
      progressPercent={progressPercent}
      stats={stats}
      history={history}
      waitingHistory={waitingHistory}
      activeSession={activeSession}
      runningSession={runningSession}
      activeWaiting={activeWaiting}
      canCompleteStage={canCompleteStage}
      layout="workspace"
    />
  );
}
