"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { completeWorkSessionAction } from "@/features/work-sessions/actions/work-session.actions";
import { isOptimisticWorkSessionId } from "@/features/work-sessions/lib/optimistic-work-session";
import { bg } from "@/src/i18n/bg";

interface CompleteWorkSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  onCompleted: () => void;
  onOptimisticComplete?: () => void;
  onCompleteFailed?: () => void;
}

export function CompleteWorkSessionDialog({
  open,
  onOpenChange,
  sessionId,
  onCompleted,
  onOptimisticComplete,
  onCompleteFailed,
}: CompleteWorkSessionDialogProps) {
  const [note, setNote] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [blocker, setBlocker] = useState("");
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setNote("");
    setNextStep("");
    setBlocker("");
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
    }

    onOpenChange(nextOpen);
  }

  const sessionNotReady = isOptimisticWorkSessionId(sessionId);

  function handleSubmit() {
    onOptimisticComplete?.();

    startTransition(async () => {
      if (sessionNotReady) {
        onCompleteFailed?.();
        toast.error(bg.workSession.completeFailed);
        return;
      }

      const result = await completeWorkSessionAction({
        id: sessionId,
        note: note.trim() ? note : undefined,
        next_step: nextStep.trim() ? nextStep : undefined,
        blocker: blocker.trim() ? blocker : undefined,
      });

      if (!result.success) {
        onCompleteFailed?.();
        toast.error(result.error);
        return;
      }

      toast.success(bg.workSession.completeSuccess);
      resetForm();
      onOpenChange(false);
      onCompleted();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>{bg.workSession.completeDialogTitle}</DialogTitle>
          <DialogDescription>
            {bg.workSession.completeDialogDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="work-session-note">
              {bg.workSession.fields.completedWork}
            </Label>
            <Textarea
              id="work-session-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="work-session-next-step">
              {bg.workSession.fields.nextStep}
            </Label>
            <Textarea
              id="work-session-next-step"
              value={nextStep}
              onChange={(event) => setNextStep(event.target.value)}
              rows={3}
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="work-session-blocker">
              {bg.workSession.fields.blocker}
            </Label>
            <Textarea
              id="work-session-blocker"
              value={blocker}
              onChange={(event) => setBlocker(event.target.value)}
              rows={3}
              disabled={isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            {bg.workSession.cancel}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || sessionNotReady}
          >
            {isPending ? bg.workSession.completing : bg.workSession.complete}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
