"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { completeStageManuallyAction } from "@/features/work-sessions/actions/work-session.actions";
import { bg } from "@/src/i18n/bg";

interface CompleteStageManuallyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  roomId: string | null;
  phaseId: string;
  stageName: string;
  workedHours: number;
  onCompleted: () => void;
}

export function CompleteStageManuallyDialog({
  open,
  onOpenChange,
  projectId,
  roomId,
  phaseId,
  stageName,
  workedHours,
  onCompleted,
}: CompleteStageManuallyDialogProps) {
  const [actualHours, setActualHours] = useState(String(workedHours || ""));
  const [note, setNote] = useState("");
  const [moveToNextStage, setMoveToNextStage] = useState(true);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setActualHours(String(workedHours || ""));
    setNote("");
    setMoveToNextStage(true);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
    } else {
      setActualHours(String(workedHours || ""));
    }

    onOpenChange(nextOpen);
  }

  function handleSubmit() {
    startTransition(async () => {
      const result = await completeStageManuallyAction({
        project_id: projectId,
        room_id: roomId,
        phase_id: phaseId,
        actual_hours: Number(actualHours) || 0,
        note: note.trim() ? note : undefined,
        move_to_next_stage: moveToNextStage,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(bg.workSessionManual.completeStageSuccess(stageName));
      resetForm();
      onOpenChange(false);
      onCompleted();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>{bg.workSessionManual.completeStageTitle}</DialogTitle>
          <DialogDescription>
            {bg.workSessionManual.completeStageDescription(stageName)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="complete-stage-hours">
              {bg.workSessionManual.actualHours}
            </Label>
            <Input
              id="complete-stage-hours"
              type="number"
              min="0"
              step="0.25"
              value={actualHours}
              onChange={(event) => setActualHours(event.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="complete-stage-note">{bg.workSessionManual.notesOptional}</Label>
            <Textarea
              id="complete-stage-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              disabled={isPending}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={moveToNextStage}
              onCheckedChange={(checked) => setMoveToNextStage(checked === true)}
              disabled={isPending}
            />
            {bg.workSessionManual.moveToNextStage}
          </label>
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
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending
              ? bg.workSessionManual.completingStage
              : bg.workSessionManual.completeStage}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
