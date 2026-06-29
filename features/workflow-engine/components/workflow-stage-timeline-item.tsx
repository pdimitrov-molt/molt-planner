"use client";

import { CheckIcon } from "lucide-react";

import { WorkflowStageWorkPanel } from "@/features/workflow-engine/components/workflow-stage-work-panel";
import { resolveStageActiveWaiting } from "@/features/workflow-engine/lib/resolve-active-waiting";
import {
  resolveTimelineStageState,
  type TimelineStageState,
} from "@/features/workflow-engine/lib/workflow-timeline-metrics";
import type {
  StageWorkData,
  WorkflowStageInstanceView,
  WorkflowStageView,
} from "@/features/workflow-engine/types/workflow-engine";
import type { WorkSession } from "@/features/work-sessions/types/work-session";
import type { WorkflowWaitingEvent } from "@/features/workflow-engine/types/workflow-waiting-event";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

interface WorkflowStageTimelineItemProps {
  projectId: string;
  stage: WorkflowStageView;
  workData: StageWorkData | null;
  runningSession: WorkSession | null;
  currentInstanceId: string | null;
  isLast: boolean;
}

export function WorkflowStageTimelineItem({
  projectId,
  stage,
  workData,
  runningSession,
  currentInstanceId,
  isLast,
}: WorkflowStageTimelineItemProps) {
  const activeWaiting = resolveStageActiveWaiting(stage, workData, currentInstanceId);
  const timelineState = resolveTimelineStageState(stage, activeWaiting);
  const isExpanded = timelineState === "current" || timelineState === "waiting";

  return (
    <div className="relative grid grid-cols-[1.5rem_1fr] gap-x-4">
      <TimelineRail state={timelineState} isLast={isLast} />

      <div className="grid min-w-0 gap-4 pb-10">
        <StageCompactRow stage={stage} timelineState={timelineState} />

        {isExpanded ? (
          <StageExpandedContent
            projectId={projectId}
            stage={stage}
            workData={workData}
            runningSession={runningSession}
            currentInstanceId={currentInstanceId}
          />
        ) : stage.execution_mode !== "PROJECT" && stage.instances.length > 0 ? (
          <StageChildList
            stage={stage}
            compact
            currentInstanceId={null}
            projectId={projectId}
            workData={workData}
            runningSession={runningSession}
          />
        ) : null}
      </div>
    </div>
  );
}

function TimelineRail({
  state,
  isLast,
}: {
  state: TimelineStageState;
  isLast: boolean;
}) {
  return (
    <div className="relative flex flex-col items-center">
      <TimelineDot state={state} />
      {!isLast ? (
        <div
          className={cn(
            "mt-1 w-px flex-1 min-h-6",
            state === "completed" ? "bg-emerald-500/40" : "bg-border"
          )}
        />
      ) : null}
    </div>
  );
}

function TimelineDot({ state }: { state: TimelineStageState }) {
  if (state === "completed") {
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        <CheckIcon className="size-3.5" strokeWidth={2.5} />
      </span>
    );
  }

  if (state === "waiting") {
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-amber-500/15 text-xs text-amber-700 dark:text-amber-400">
        ⏸
      </span>
    );
  }

  if (state === "current") {
    return (
      <span className="relative flex size-6 items-center justify-center">
        <span className="absolute size-6 rounded-full bg-foreground/10" />
        <span className="relative size-2.5 rounded-full bg-foreground" />
      </span>
    );
  }

  return (
    <span className="flex size-6 items-center justify-center">
      <span className="size-2 rounded-full border border-border bg-background" />
    </span>
  );
}

function StageCompactRow({
  stage,
  timelineState,
}: {
  stage: WorkflowStageView;
  timelineState: TimelineStageState;
}) {
  return (
    <div
      className={cn(
        "grid gap-1 pt-0.5",
        timelineState === "completed" && "opacity-60",
        timelineState === "upcoming" && "opacity-50"
      )}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p
          className={cn(
            "text-base leading-snug",
            timelineState === "current" || timelineState === "waiting"
              ? "font-semibold"
              : "font-medium"
          )}
        >
          {stage.name}
        </p>
        {timelineState === "waiting" ? (
          <span className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
            {bg.workflowEngine.workspaceTimeline.waiting}
          </span>
        ) : timelineState === "current" ? (
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {bg.workflowEngine.workspaceTimeline.now}
          </span>
        ) : null}
        <span className="text-sm tabular-nums text-muted-foreground">
          {stage.progress_percent}%
        </span>
      </div>
      {timelineState === "waiting" ? (
        <p className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
          {bg.workflowWaiting.statusBadge}
        </p>
      ) : timelineState !== "current" ? (
        <p className="text-sm text-muted-foreground">
          {bg.labels.phaseStatus[stage.status]}
        </p>
      ) : null}
    </div>
  );
}

function StageExpandedContent({
  projectId,
  stage,
  workData,
  runningSession,
  currentInstanceId,
}: {
  projectId: string;
  stage: WorkflowStageView;
  workData: StageWorkData | null;
  runningSession: WorkSession | null;
  currentInstanceId: string | null;
}) {
  if (stage.execution_mode === "PROJECT") {
    return (
      <ProjectStagePanel
        projectId={projectId}
        stage={stage}
        workData={workData}
        runningSession={runningSession}
      />
    );
  }

  if (stage.instances.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {stage.execution_mode === "DOCUMENTS"
          ? bg.workflowEngine.noDocumentItemsForStage
          : bg.workflowEngine.noInstancesForStage}
      </p>
    );
  }

  return (
    <StageChildList
      stage={stage}
      compact={false}
      currentInstanceId={currentInstanceId}
      projectId={projectId}
      workData={workData}
      runningSession={runningSession}
    />
  );
}

function ProjectStagePanel({
  projectId,
  stage,
  workData,
  runningSession,
}: {
  projectId: string;
  stage: WorkflowStageView;
  workData: StageWorkData | null;
  runningSession: WorkSession | null;
}) {
  const instance = stage.instances[0] ?? null;
  const instanceWork = instance ? workData?.instances[instance.id] : null;

  if (!instance || !instanceWork?.timer_target_id) {
    return (
      <p className="text-sm text-muted-foreground">
        {bg.workSessionManual.stageWithoutPhase}
      </p>
    );
  }

  return (
    <WorkflowStageWorkPanel
      projectId={projectId}
      workflowInstanceId={instance.id}
      roomId={null}
      timerTargetId={instanceWork.timer_target_id}
      stageName={stage.name}
      roomName={null}
      progressPercent={instance.progress_percent}
      stats={instanceWork.stats}
      history={instanceWork.history}
      activeSession={instanceWork.activeSession}
      runningSession={runningSession}
      activeWaiting={instanceWork.activeWaiting}
      waitingHistory={instanceWork.waitingHistory}
      canCompleteStage={instance.status !== "completed"}
    />
  );
}

function StageChildList({
  stage,
  compact,
  currentInstanceId,
  projectId,
  workData,
  runningSession,
}: {
  stage: WorkflowStageView;
  compact: boolean;
  currentInstanceId: string | null;
  projectId: string;
  workData: StageWorkData | null;
  runningSession: WorkSession | null;
}) {
  const showStageHeading =
    !compact && stage.execution_mode === "DOCUMENTS" && stage.instances.length > 0;

  return (
    <div className="grid gap-3 border-l border-border/60 pl-5">
      {showStageHeading ? (
        <p className="text-sm font-medium text-muted-foreground">{stage.name}</p>
      ) : null}

      {stage.instances.map((instance, index) => (
        <div key={instance.id} className="grid gap-3">
          {showStageHeading && index > 0 ? (
            <div className="h-px w-8 bg-border/60" aria-hidden />
          ) : null}
          <InstanceRow
            instance={instance}
            executionMode={stage.execution_mode}
            isCurrent={!compact && instance.id === currentInstanceId}
            compact={compact || instance.id !== currentInstanceId}
            activeWaiting={workData?.instances[instance.id]?.activeWaiting ?? null}
          />
          {!compact && instance.id === currentInstanceId ? (
            <InstanceWorkPanel
              projectId={projectId}
              stage={stage}
              instance={instance}
              workData={workData}
              runningSession={runningSession}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function InstanceRow({
  instance,
  executionMode,
  isCurrent,
  compact,
  activeWaiting,
}: {
  instance: WorkflowStageInstanceView;
  executionMode: WorkflowStageView["execution_mode"];
  isCurrent: boolean;
  compact: boolean;
  activeWaiting: WorkflowWaitingEvent | null;
}) {
  const label = resolveInstanceLabel(instance, executionMode);
  const isWaiting = isCurrent && activeWaiting !== null;

  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-3",
        compact && "opacity-60",
        isCurrent && "font-medium"
      )}
    >
      <div className="flex min-w-0 items-baseline gap-2">
        <span className="truncate">{label}</span>
        {isWaiting ? (
          <span className="shrink-0 text-xs uppercase tracking-wide text-amber-700 dark:text-amber-400">
            {bg.workflowEngine.workspaceTimeline.waiting}
          </span>
        ) : isCurrent ? (
          <span className="shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
            {bg.workflowEngine.workspaceTimeline.now}
          </span>
        ) : null}
      </div>
      <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
        {instance.progress_percent}%
      </span>
    </div>
  );
}

function InstanceWorkPanel({
  projectId,
  stage,
  instance,
  workData,
  runningSession,
}: {
  projectId: string;
  stage: WorkflowStageView;
  instance: WorkflowStageInstanceView;
  workData: StageWorkData | null;
  runningSession: WorkSession | null;
}) {
  const instanceWork = workData?.instances[instance.id];

  if (!instanceWork?.timer_target_id) {
    return (
      <p className="text-sm text-muted-foreground">
        {bg.workSessionManual.stageWithoutPhase}
      </p>
    );
  }

  return (
    <WorkflowStageWorkPanel
      projectId={projectId}
      workflowInstanceId={instance.id}
      roomId={stage.execution_mode === "ROOMS" ? instance.room_id : null}
      timerTargetId={instanceWork.timer_target_id}
      stageName={stage.name}
      roomName={stage.execution_mode === "ROOMS" ? instance.room_name : null}
      scopeLabel={
        stage.execution_mode === "DOCUMENTS"
          ? (instance.document_item_name ?? undefined)
          : undefined
      }
      progressPercent={instance.progress_percent}
      stats={instanceWork.stats}
      history={instanceWork.history}
      activeSession={instanceWork.activeSession}
      runningSession={runningSession}
      activeWaiting={instanceWork.activeWaiting}
      waitingHistory={instanceWork.waitingHistory}
      canCompleteStage={instance.status !== "completed"}
    />
  );
}

function resolveInstanceLabel(
  instance: WorkflowStageInstanceView,
  executionMode: WorkflowStageView["execution_mode"]
): string {
  if (executionMode === "ROOMS") {
    return instance.room_name ?? instance.room_id ?? instance.id;
  }

  if (executionMode === "DOCUMENTS") {
    return instance.document_item_name ?? instance.document_item_key ?? instance.id;
  }

  return instance.id;
}
