"use client";

import { useState, type ReactNode } from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { CompleteStageManuallyDialog } from "@/features/work-sessions/components/complete-stage-manually-dialog";
import { CompleteWorkSessionDialog } from "@/features/work-sessions/components/complete-work-session-dialog";
import { LiveWorkSessionTimer } from "@/features/work-sessions/components/live-work-session-timer";
import { ManualWorkSessionDialog } from "@/features/work-sessions/components/manual-work-session-dialog";
import { PhaseWorkSessionHistory } from "@/features/work-sessions/components/phase-work-session-history";
import { useOptimisticWorkSession } from "@/features/work-sessions/hooks/use-optimistic-work-session";
import { isOptimisticWorkSessionId } from "@/features/work-sessions/lib/optimistic-work-session";
import { StartWaitingDialog } from "@/features/workflow-engine/components/start-waiting-dialog";
import { StageWaitingPanel } from "@/features/workflow-engine/components/stage-waiting-panel";
import { StageWaitingHistory } from "@/features/workflow-engine/components/stage-waiting-history";
import { useOptimisticWaitingStatus } from "@/features/workflow-engine/hooks/use-optimistic-waiting";
import type { WorkflowWaitingEvent } from "@/features/workflow-engine/types/workflow-waiting-event";
import type { PhaseWorkStats } from "@/features/work-sessions/lib/calculate-phase-work-stats";
import type { PhaseWorkSessionHistoryEntry } from "@/features/work-sessions/types/work-session-log";
import type { WorkSession } from "@/features/work-sessions/types/work-session";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

interface StageWorkPanelProps {
  projectId: string;
  workflowInstanceId?: string;
  roomId: string | null;
  phaseId: string;
  stageName: string;
  roomName?: string | null;
  scopeLabel?: string;
  progressPercent?: number;
  stats: PhaseWorkStats;
  history: PhaseWorkSessionHistoryEntry[];
  waitingHistory?: WorkflowWaitingEvent[];
  activeSession: WorkSession | null;
  runningSession: WorkSession | null;
  activeWaiting?: WorkflowWaitingEvent | null;
  canCompleteStage?: boolean;
  layout?: "compact" | "accordion" | "workspace";
}

export function StageWorkPanel({
  projectId,
  workflowInstanceId,
  roomId,
  phaseId,
  stageName,
  roomName,
  scopeLabel,
  progressPercent = 0,
  stats,
  history,
  waitingHistory = [],
  activeSession,
  runningSession,
  activeWaiting = null,
  canCompleteStage = true,
  layout = "accordion",
}: StageWorkPanelProps) {
  const [completeOpen, setCompleteOpen] = useState(false);
  const [manualLogOpen, setManualLogOpen] = useState(false);
  const [completeStageOpen, setCompleteStageOpen] = useState(false);
  const [startWaitingOpen, setStartWaitingOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(history.length > 0);
  const [statsOpen, setStatsOpen] = useState(false);

  const {
    activeSession: displayActiveSession,
    runningSession: displayRunningSession,
    isPending,
    handleStart,
    handlePause,
    handleResume,
    applyOptimisticComplete,
    revertOptimisticState,
    refreshAfterAction,
  } = useOptimisticWorkSession({
    activeSession,
    runningSession,
    projectId,
    roomId,
    phaseId,
  });

  const {
    activeWaiting: displayWaiting,
    applyOptimisticWaiting,
    clearOptimisticWaiting,
    revertOptimisticWaiting,
  } = useOptimisticWaitingStatus(activeWaiting);

  const isAccordion = layout === "accordion";
  const isWorkspace = layout === "workspace";
  const isWaiting = displayWaiting !== null;
  const canStartWaiting = Boolean(workflowInstanceId) && canCompleteStage && !isWaiting;
  const hasOtherRunningSession =
    displayRunningSession !== null && displayRunningSession.phase_id !== phaseId;
  const sessionFinishDisabled =
    isPending ||
    (displayActiveSession !== null && isOptimisticWorkSessionId(displayActiveSession.id));

  const waitingPanelProps = {
    onChanged: refreshAfterAction,
    onOptimisticCancel: clearOptimisticWaiting,
    onCancelFailed: revertOptimisticWaiting,
    onOptimisticFinish: clearOptimisticWaiting,
    onFinishFailed: revertOptimisticWaiting,
  };

  const varianceLabel =
    stats.variance_hours === 0
      ? bg.workSessionManual.varianceEven
      : stats.variance_hours > 0
        ? bg.workSessionManual.varianceOver(Math.abs(stats.variance_hours))
        : bg.workSessionManual.varianceUnder(Math.abs(stats.variance_hours));

  return (
    <section className={cn("grid", isWorkspace ? "gap-10" : "gap-4")}>
      {isWorkspace ? (
        <>
          <WorkspaceSection title={bg.workflowEngine.workspaceTimeline.mainAction}>
            {isWaiting ? (
              <StageWaitingPanel waiting={displayWaiting} {...waitingPanelProps} />
            ) : (
              <TimerCard
                activeSession={displayActiveSession}
                hasOtherRunningSession={hasOtherRunningSession}
                isPending={isPending}
                sessionFinishDisabled={sessionFinishDisabled}
                onStart={handleStart}
                onPause={handlePause}
                onResume={handleResume}
                onFinish={() => setCompleteOpen(true)}
                canCompleteStage={canCompleteStage}
                canStartWaiting={canStartWaiting}
                onLogManual={() => setManualLogOpen(true)}
                onCompleteStage={() => setCompleteStageOpen(true)}
                onStartWaiting={() => setStartWaitingOpen(true)}
                stackedActions
                hideTimer
              />
            )}
          </WorkspaceSection>

          {displayActiveSession?.status === "running" ? (
            <WorkspaceSection title={bg.workflowEngine.workspaceTimeline.timer}>
              <LiveWorkSessionTimer startedAt={displayActiveSession.started_at} />
            </WorkspaceSection>
          ) : null}

          <WorkspaceSection title={bg.workflowEngine.workspaceTimeline.statistics}>
            <div className="grid gap-2 text-sm">
              <StatRow
                label={bg.workSessionManual.estimatedLabel}
                value={`${stats.estimated_hours}${bg.common.hoursShort}`}
              />
              <StatRow
                label={bg.workSessionManual.workedLabel}
                value={`${stats.worked_hours}${bg.common.hoursShort}`}
              />
              <StatRow
                label={bg.workSessionManual.remainingLabel}
                value={`${stats.remaining_hours}${bg.common.hoursShort}`}
              />
              <StatRow label={bg.workSessionManual.varianceLabel} value={varianceLabel} />
              <StatRow
                label={bg.workSessionManual.totalWorked}
                value={formatTotalWorked(stats.worked_minutes)}
              />
            </div>
          </WorkspaceSection>

          <WorkspaceSection title={bg.workflowEngine.workspaceTimeline.history}>
            <PhaseWorkSessionHistory entries={history} onChanged={refreshAfterAction} />
            {workflowInstanceId ? (
              <div className="grid gap-3 pt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {bg.workflowWaiting.historyTitle}
                </p>
                <StageWaitingHistory entries={waitingHistory} />
              </div>
            ) : null}
          </WorkspaceSection>

          <WorkspaceSection title={bg.workflowEngine.workspaceTimeline.notes}>
            <p className="text-sm text-muted-foreground">
              {bg.workflowEngine.workspaceTimeline.notesEmpty}
            </p>
          </WorkspaceSection>

          <WorkspaceSection title={bg.workflowEngine.workspaceTimeline.files}>
            <p className="text-sm text-muted-foreground">
              {bg.workflowEngine.workspaceTimeline.filesEmpty}
            </p>
          </WorkspaceSection>
        </>
      ) : isAccordion ? (
        <>
          <div className="grid gap-2">
            {scopeLabel ? (
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {scopeLabel}
              </p>
            ) : null}
            {roomName ? (
              <p className="text-sm text-muted-foreground">{roomName}</p>
            ) : null}
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">{bg.workSessionManual.progressLabel}</span>
              <span className="font-medium tabular-nums">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-xl border border-border/50 bg-muted/20 px-3 py-2 text-xs">
            <StatCell
              label={bg.workSessionManual.estimatedLabel}
              value={`${stats.estimated_hours}${bg.common.hoursShort}`}
            />
            <StatCell
              label={bg.workSessionManual.workedLabel}
              value={`${stats.worked_hours}${bg.common.hoursShort}`}
            />
            <StatCell
              label={bg.workSessionManual.remainingLabel}
              value={`${stats.remaining_hours}${bg.common.hoursShort}`}
            />
          </div>
        </>
      ) : (
        <div className="grid gap-1">
          <p className="font-medium">{stageName}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{bg.workSessionManual.estimated(stats.estimated_hours)}</span>
            <span>{bg.workSessionManual.worked(stats.worked_hours)}</span>
            <span>{bg.workSessionManual.remaining(stats.remaining_hours)}</span>
          </div>
        </div>
      )}

      {!isWorkspace ? (
        isWaiting ? (
          <StageWaitingPanel waiting={displayWaiting} {...waitingPanelProps} />
        ) : (
          <TimerCard
            activeSession={displayActiveSession}
            hasOtherRunningSession={hasOtherRunningSession}
            isPending={isPending}
            sessionFinishDisabled={sessionFinishDisabled}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onFinish={() => setCompleteOpen(true)}
            canCompleteStage={canCompleteStage}
            canStartWaiting={canStartWaiting}
            onLogManual={() => setManualLogOpen(true)}
            onCompleteStage={() => setCompleteStageOpen(true)}
            onStartWaiting={() => setStartWaitingOpen(true)}
            stackedActions={isAccordion}
          />
        )
      ) : null}

      {!isWorkspace ? (
        isAccordion ? (
        <>
          <div className="grid gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {bg.workSessionManual.workHistory}
            </p>
            <PhaseWorkSessionHistory entries={history} onChanged={refreshAfterAction} />
          </div>

          <div className="grid gap-2 rounded-xl border border-border/50 bg-muted/20 p-3 text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {bg.workSessionManual.statistics}
            </p>
            <StatRow
              label={bg.workSessionManual.estimatedLabel}
              value={`${stats.estimated_hours}${bg.common.hoursShort}`}
            />
            <StatRow
              label={bg.workSessionManual.workedLabel}
              value={`${stats.worked_hours}${bg.common.hoursShort}`}
            />
            <StatRow
              label={bg.workSessionManual.remainingLabel}
              value={`${stats.remaining_hours}${bg.common.hoursShort}`}
            />
            <StatRow label={bg.workSessionManual.varianceLabel} value={varianceLabel} />
            <StatRow
              label={bg.workSessionManual.totalWorked}
              value={formatTotalWorked(stats.worked_minutes)}
            />
          </div>
        </>
      ) : (
        <>
          <button
            type="button"
            className="flex items-center justify-between rounded-lg px-1 py-1 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
            onClick={() => setHistoryOpen((value) => !value)}
          >
            {bg.workSessionManual.workHistory}
            <ChevronDownIcon
              className={cn("size-4 transition-transform", historyOpen && "rotate-180")}
            />
          </button>

          {historyOpen ? (
            <PhaseWorkSessionHistory entries={history} onChanged={refreshAfterAction} />
          ) : null}

          <button
            type="button"
            className="flex items-center justify-between rounded-lg px-1 py-1 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
            onClick={() => setStatsOpen((value) => !value)}
          >
            {bg.workSessionManual.statistics}
            <ChevronDownIcon
              className={cn("size-4 transition-transform", statsOpen && "rotate-180")}
            />
          </button>

          {statsOpen ? (
            <div className="grid gap-2 rounded-xl border border-border/50 bg-background/60 p-3 text-sm">
              <StatRow
                label={bg.workSessionManual.estimatedLabel}
                value={`${stats.estimated_hours}${bg.common.hoursShort}`}
              />
              <StatRow
                label={bg.workSessionManual.workedLabel}
                value={`${stats.worked_hours}${bg.common.hoursShort}`}
              />
              <StatRow
                label={bg.workSessionManual.remainingLabel}
                value={`${stats.remaining_hours}${bg.common.hoursShort}`}
              />
              <StatRow label={bg.workSessionManual.varianceLabel} value={varianceLabel} />
              <StatRow
                label={bg.workSessionManual.totalWorked}
                value={formatTotalWorked(stats.worked_minutes)}
              />
            </div>
          ) : null}
        </>
      )
      ) : null}

      {displayActiveSession ? (
        <CompleteWorkSessionDialog
          open={completeOpen}
          onOpenChange={setCompleteOpen}
          sessionId={displayActiveSession.id}
          onOptimisticComplete={applyOptimisticComplete}
          onCompleteFailed={revertOptimisticState}
          onCompleted={refreshAfterAction}
        />
      ) : null}

      <ManualWorkSessionDialog
        open={manualLogOpen}
        onOpenChange={setManualLogOpen}
        projectId={projectId}
        roomId={roomId}
        phaseId={phaseId}
        onSaved={refreshAfterAction}
      />

      <CompleteStageManuallyDialog
        open={completeStageOpen}
        onOpenChange={setCompleteStageOpen}
        projectId={projectId}
        roomId={roomId}
        phaseId={phaseId}
        stageName={stageName}
        workedHours={stats.worked_hours}
        onCompleted={refreshAfterAction}
      />

      {workflowInstanceId ? (
        <StartWaitingDialog
          open={startWaitingOpen}
          onOpenChange={setStartWaitingOpen}
          projectId={projectId}
          workflowInstanceId={workflowInstanceId}
          onOptimisticStart={applyOptimisticWaiting}
          onStartFailed={revertOptimisticWaiting}
          onStarted={refreshAfterAction}
        />
      ) : null}
    </section>
  );
}

function TimerCard({
  activeSession,
  hasOtherRunningSession,
  isPending,
  sessionFinishDisabled,
  onStart,
  onPause,
  onResume,
  onFinish,
  canCompleteStage,
  canStartWaiting,
  onLogManual,
  onCompleteStage,
  onStartWaiting,
  stackedActions,
  hideTimer = false,
}: {
  activeSession: WorkSession | null;
  hasOtherRunningSession: boolean;
  isPending: boolean;
  sessionFinishDisabled: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
  canCompleteStage: boolean;
  canStartWaiting: boolean;
  onLogManual: () => void;
  onCompleteStage: () => void;
  onStartWaiting: () => void;
  stackedActions: boolean;
  hideTimer?: boolean;
}) {
  if (activeSession?.status === "running") {
    return (
      <div
        className={cn(
          "grid gap-3",
          !hideTimer && "rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3"
        )}
      >
        {!hideTimer ? (
          <>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              {bg.workSession.runningLabel}
            </p>
            <LiveWorkSessionTimer startedAt={activeSession.started_at} />
          </>
        ) : null}
        <div className="grid gap-2">
          <Button
            type="button"
            variant="secondary"
            className="w-full rounded-xl"
            onClick={onPause}
            disabled={isPending}
          >
            {bg.workSession.pause}
          </Button>
          <Button
            type="button"
            className="w-full rounded-xl"
            onClick={onFinish}
            disabled={sessionFinishDisabled}
          >
            {bg.workSession.finish}
          </Button>
          <MoreActionsButton
            disabled={isPending}
            canCompleteStage={canCompleteStage}
            canStartWaiting={canStartWaiting}
            onLogManual={onLogManual}
            onCompleteStage={onCompleteStage}
            onStartWaiting={onStartWaiting}
            fullWidth={stackedActions}
          />
        </div>
      </div>
    );
  }

  if (activeSession?.status === "paused") {
    return (
      <div className="grid gap-3 rounded-xl border border-border/50 bg-muted/40 p-3">
        <p className="text-sm font-medium text-muted-foreground">
          {bg.workSession.pausedLabel}
        </p>
        <div className="grid gap-2">
          <Button
            type="button"
            className="w-full rounded-xl"
            onClick={onResume}
            disabled={isPending}
          >
            {bg.workSession.resume}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full rounded-xl"
            onClick={onFinish}
            disabled={sessionFinishDisabled}
          >
            {bg.workSession.finish}
          </Button>
          <MoreActionsButton
            disabled={isPending}
            canCompleteStage={canCompleteStage}
            canStartWaiting={canStartWaiting}
            onLogManual={onLogManual}
            onCompleteStage={onCompleteStage}
            onStartWaiting={onStartWaiting}
            fullWidth={stackedActions}
          />
        </div>
      </div>
    );
  }

  if (hasOtherRunningSession) {
    return (
      <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
        <p className="text-sm text-muted-foreground">{bg.workSession.otherSessionActive}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <Button
        type="button"
        className="h-11 w-full rounded-xl text-base"
        onClick={onStart}
        disabled={isPending}
      >
        {bg.workSession.start}
      </Button>
      <MoreActionsButton
        disabled={isPending}
        canCompleteStage={canCompleteStage}
        canStartWaiting={canStartWaiting}
        onLogManual={onLogManual}
        onCompleteStage={onCompleteStage}
        onStartWaiting={onStartWaiting}
        fullWidth={stackedActions}
      />
    </div>
  );
}

function WorkspaceSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}

function MoreActionsButton({
  disabled,
  canCompleteStage,
  canStartWaiting,
  onLogManual,
  onCompleteStage,
  onStartWaiting,
  fullWidth,
}: {
  disabled: boolean;
  canCompleteStage: boolean;
  canStartWaiting: boolean;
  onLogManual: () => void;
  onCompleteStage: () => void;
  onStartWaiting: () => void;
  fullWidth: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn("rounded-xl", fullWidth ? "w-full justify-between" : "shrink-0")}
          disabled={disabled}
          aria-label={bg.workSessionManual.moreActions}
        >
          {bg.workSessionManual.moreActions}
          <ChevronDownIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onLogManual}>
          {bg.workSessionManual.logManually}
        </DropdownMenuItem>
        {canCompleteStage ? (
          <DropdownMenuItem onClick={onCompleteStage}>
            {bg.workSessionManual.completeStageManually}
          </DropdownMenuItem>
        ) : null}
        {canStartWaiting ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onStartWaiting}>
              {bg.workflowWaiting.putOnWaiting}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function formatTotalWorked(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}${bg.common.minutesShort}`;
  }

  if (remainingMinutes === 0) {
    return `${hours}${bg.common.hoursShort}`;
  }

  return `${hours}${bg.common.hoursShort} ${remainingMinutes}${bg.common.minutesShort}`;
}
