"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  pauseWorkSessionAction,
  resumeWorkSessionAction,
  startWorkSessionAction,
} from "@/features/work-sessions/actions/work-session.actions";
import {
  buildOptimisticWorkSession,
  withWorkSessionStatus,
} from "@/features/work-sessions/lib/optimistic-work-session";
import type { WorkSession } from "@/features/work-sessions/types/work-session";
import { bg } from "@/src/i18n/bg";

interface UseOptimisticWorkSessionInput {
  activeSession: WorkSession | null;
  runningSession: WorkSession | null;
  projectId: string;
  roomId: string | null;
  phaseId: string;
}

export function useOptimisticWorkSession(input: UseOptimisticWorkSessionInput) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeOverride, setActiveOverride] = useState<WorkSession | null | undefined>(
    undefined
  );
  const [runningOverride, setRunningOverride] = useState<WorkSession | null | undefined>(
    undefined
  );

  useEffect(() => {
    setActiveOverride(undefined);
    setRunningOverride(undefined);
  }, [input.activeSession, input.runningSession]);

  const activeSession =
    activeOverride !== undefined ? activeOverride : input.activeSession;
  const runningSession =
    runningOverride !== undefined ? runningOverride : input.runningSession;

  function revertOptimisticState() {
    setActiveOverride(undefined);
    setRunningOverride(undefined);
  }

  function refreshAfterAction() {
    router.refresh();
  }

  function applyOptimisticComplete() {
    setActiveOverride(null);
    setRunningOverride(null);
  }

  function handleStart() {
    const optimisticSession = buildOptimisticWorkSession({
      projectId: input.projectId,
      roomId: input.roomId,
      phaseId: input.phaseId,
      status: "running",
    });

    setActiveOverride(optimisticSession);
    setRunningOverride(optimisticSession);

    startTransition(async () => {
      const result = await startWorkSessionAction({
        project_id: input.projectId,
        room_id: input.roomId,
        phase_id: input.phaseId,
      });

      if (!result.success) {
        revertOptimisticState();
        toast.error(result.error);
        return;
      }

      toast.success(bg.workSession.startSuccess);
      refreshAfterAction();
    });
  }

  function handlePause() {
    const currentSession = activeSession ?? input.activeSession;

    if (!currentSession) {
      return;
    }

    const optimisticSession = withWorkSessionStatus(currentSession, "paused");
    setActiveOverride(optimisticSession);
    setRunningOverride(optimisticSession);

    startTransition(async () => {
      const result = await pauseWorkSessionAction({ id: currentSession.id });

      if (!result.success) {
        revertOptimisticState();
        toast.error(result.error);
        return;
      }

      toast.success(bg.workSession.pauseSuccess);
      refreshAfterAction();
    });
  }

  function handleResume() {
    const currentSession = activeSession ?? input.activeSession;

    if (!currentSession) {
      return;
    }

    const optimisticSession = withWorkSessionStatus(currentSession, "running");
    setActiveOverride(optimisticSession);
    setRunningOverride(optimisticSession);

    startTransition(async () => {
      const result = await resumeWorkSessionAction({ id: currentSession.id });

      if (!result.success) {
        revertOptimisticState();
        toast.error(result.error);
        return;
      }

      toast.success(bg.workSession.resumeSuccess);
      refreshAfterAction();
    });
  }

  return {
    activeSession,
    runningSession,
    isPending,
    handleStart,
    handlePause,
    handleResume,
    applyOptimisticComplete,
    revertOptimisticState,
    refreshAfterAction,
  };
}
