"use client";

import { useEffect, useState } from "react";

import type { WorkflowWaitingEvent } from "@/features/workflow-engine/types/workflow-waiting-event";

export function useOptimisticWaitingStatus(serverWaiting: WorkflowWaitingEvent | null) {
  const [waitingOverride, setWaitingOverride] = useState<
    WorkflowWaitingEvent | null | undefined
  >(undefined);

  useEffect(() => {
    setWaitingOverride(undefined);
  }, [serverWaiting]);

  const activeWaiting =
    waitingOverride !== undefined ? waitingOverride : serverWaiting;

  function applyOptimisticWaiting(event: WorkflowWaitingEvent) {
    setWaitingOverride(event);
  }

  function clearOptimisticWaiting() {
    setWaitingOverride(null);
  }

  function revertOptimisticWaiting() {
    setWaitingOverride(undefined);
  }

  return {
    activeWaiting,
    applyOptimisticWaiting,
    clearOptimisticWaiting,
    revertOptimisticWaiting,
  };
}
