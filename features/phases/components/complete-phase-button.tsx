"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { completePhaseAction } from "@/features/phases/actions/phase.actions";
import { bg } from "@/src/i18n/bg";

interface CompletePhaseButtonProps {
  projectId: string;
  roomId: string;
  phaseId: string;
  phaseLabel: string;
  canComplete: boolean;
}

export function CompletePhaseButton({
  projectId,
  roomId,
  phaseId,
  phaseLabel,
  canComplete,
}: CompletePhaseButtonProps) {
  const [isPending, startTransition] = useTransition();

  if (!canComplete) {
    return null;
  }

  function handleComplete() {
    startTransition(async () => {
      const result = await completePhaseAction({
        project_id: projectId,
        room_id: roomId,
        phase_id: phaseId,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(bg.room.phaseCompleteToast(phaseLabel));
    });
  }

  return (
    <Button type="button" onClick={handleComplete} disabled={isPending}>
      {isPending ? bg.room.completing : bg.room.completePhase(phaseLabel)}
    </Button>
  );
}
