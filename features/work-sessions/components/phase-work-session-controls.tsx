"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CompleteWorkSessionDialog } from "@/features/work-sessions/components/complete-work-session-dialog";
import { LiveWorkSessionTimer } from "@/features/work-sessions/components/live-work-session-timer";
import {
  pauseWorkSessionAction,
  resumeWorkSessionAction,
  startWorkSessionAction,
} from "@/features/work-sessions/actions/work-session.actions";
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
  const router = useRouter();
  const [completeOpen, setCompleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const hasOtherRunningSession =
    runningSession !== null && runningSession.phase_id !== phaseId;

  function refreshAfterAction() {
    router.refresh();
  }

  function handleStart() {
    startTransition(async () => {
      const result = await startWorkSessionAction({
        project_id: projectId,
        room_id: roomId,
        phase_id: phaseId,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(bg.workSession.startSuccess);
      refreshAfterAction();
    });
  }

  function handlePause() {
    if (!activeSession) {
      return;
    }

    startTransition(async () => {
      const result = await pauseWorkSessionAction({ id: activeSession.id });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(bg.workSession.pauseSuccess);
      refreshAfterAction();
    });
  }

  function handleResume() {
    if (!activeSession) {
      return;
    }

    startTransition(async () => {
      const result = await resumeWorkSessionAction({ id: activeSession.id });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(bg.workSession.resumeSuccess);
      refreshAfterAction();
    });
  }

  if (activeSession?.status === "running") {
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
          <LiveWorkSessionTimer startedAt={activeSession.started_at} />
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
              disabled={isPending}
            >
              {bg.workSession.finish}
            </Button>
          </div>
        </div>

        <CompleteWorkSessionDialog
          open={completeOpen}
          onOpenChange={setCompleteOpen}
          sessionId={activeSession.id}
          onCompleted={refreshAfterAction}
        />
      </>
    );
  }

  if (activeSession?.status === "paused") {
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
              disabled={isPending}
            >
              {bg.workSession.finish}
            </Button>
          </div>
        </div>

        <CompleteWorkSessionDialog
          open={completeOpen}
          onOpenChange={setCompleteOpen}
          sessionId={activeSession.id}
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
