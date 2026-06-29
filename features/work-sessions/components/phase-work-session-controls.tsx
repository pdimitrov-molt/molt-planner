"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CompleteWorkSessionDialog } from "@/features/work-sessions/components/complete-work-session-dialog";
import { LiveWorkSessionTimer } from "@/features/work-sessions/components/live-work-session-timer";
import { useOptimisticWorkSession } from "@/features/work-sessions/hooks/use-optimistic-work-session";
import { isOptimisticWorkSessionId } from "@/features/work-sessions/lib/optimistic-work-session";
import type { WorkSession } from "@/features/work-sessions/types/work-session";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

interface PhaseWorkSessionControlsProps {
  projectId: string;
  roomId: string;
  phaseId: string;
  activeSession: WorkSession | null;
  runningSession: WorkSession | null;
}

export function PhaseWorkSessionControls({
  projectId,
  roomId,
  phaseId,
  activeSession,
  runningSession,
}: PhaseWorkSessionControlsProps) {
  const [completeOpen, setCompleteOpen] = useState(false);

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

  const hasOtherRunningSession =
    displayRunningSession !== null && displayRunningSession.phase_id !== phaseId;
  const sessionFinishDisabled =
    isPending ||
    (displayActiveSession !== null && isOptimisticWorkSessionId(displayActiveSession.id));

  if (displayActiveSession?.status === "running") {
    return (
      <>
        <div
          className={cn(
            "mt-4 grid gap-4 rounded-2xl bg-emerald-500/10 p-4",
            "shadow-sm"
          )}
        >
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            {bg.workSession.runningLabel}
          </p>
          <LiveWorkSessionTimer startedAt={displayActiveSession.started_at} />
          <div className="grid gap-2">
            <Button
              type="button"
              size="lg"
              variant="secondary"
              className="w-full rounded-xl"
              onClick={handlePause}
              disabled={isPending}
            >
              {bg.workSession.pause}
            </Button>
            <Button
              type="button"
              size="lg"
              className="w-full rounded-xl"
              onClick={() => setCompleteOpen(true)}
              disabled={sessionFinishDisabled}
            >
              {bg.workSession.finish}
            </Button>
          </div>
        </div>

        <CompleteWorkSessionDialog
          open={completeOpen}
          onOpenChange={setCompleteOpen}
          sessionId={displayActiveSession.id}
          onOptimisticComplete={applyOptimisticComplete}
          onCompleteFailed={revertOptimisticState}
          onCompleted={refreshAfterAction}
        />
      </>
    );
  }

  if (displayActiveSession?.status === "paused") {
    return (
      <>
        <div className="mt-4 grid gap-4 rounded-2xl bg-muted/60 p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            {bg.workSession.pausedLabel}
          </p>
          <div className="grid gap-2">
            <Button
              type="button"
              size="lg"
              className="w-full rounded-xl"
              onClick={handleResume}
              disabled={isPending}
            >
              {bg.workSession.resume}
            </Button>
            <Button
              type="button"
              size="lg"
              variant="secondary"
              className="w-full rounded-xl"
              onClick={() => setCompleteOpen(true)}
              disabled={sessionFinishDisabled}
            >
              {bg.workSession.finish}
            </Button>
          </div>
        </div>

        <CompleteWorkSessionDialog
          open={completeOpen}
          onOpenChange={setCompleteOpen}
          sessionId={displayActiveSession.id}
          onOptimisticComplete={applyOptimisticComplete}
          onCompleteFailed={revertOptimisticState}
          onCompleted={refreshAfterAction}
        />
      </>
    );
  }

  if (hasOtherRunningSession) {
    return (
      <div className="mt-4 rounded-2xl bg-muted/50 p-4 shadow-sm">
        <p className="text-sm text-muted-foreground">
          {bg.workSession.otherSessionActive}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <Button
        type="button"
        size="lg"
        className="h-12 w-full rounded-xl text-base"
        onClick={handleStart}
        disabled={isPending}
      >
        {bg.workSession.start}
      </Button>
    </div>
  );
}
