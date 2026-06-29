"use client";

import { useEffect, useState, useTransition } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { logManualWorkSessionAction } from "@/features/work-sessions/actions/work-session.actions";
import { bg } from "@/src/i18n/bg";

interface ManualWorkSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  roomId: string | null;
  phaseId: string;
  onSaved: () => void;
}

type ManualLogMode = "range" | "duration";

function todayDateValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ManualWorkSessionDialog({
  open,
  onOpenChange,
  projectId,
  roomId,
  phaseId,
  onSaved,
}: ManualWorkSessionDialogProps) {
  const [mode, setMode] = useState<ManualLogMode>("range");
  const [date, setDate] = useState(todayDateValue());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setDate(todayDateValue());
    }
  }, [open]);

  function resetForm() {
    setMode("range");
    setDate(todayDateValue());
    setStartTime("09:00");
    setEndTime("10:00");
    setDurationMinutes("60");
    setNote("");
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
    }

    onOpenChange(nextOpen);
  }

  function handleSubmit() {
    startTransition(async () => {
      const result =
        mode === "range"
          ? await logManualWorkSessionAction({
              project_id: projectId,
              room_id: roomId,
              phase_id: phaseId,
              mode: "range",
              date,
              start_time: startTime,
              end_time: endTime,
              note: note.trim() ? note : undefined,
            })
          : await logManualWorkSessionAction({
              project_id: projectId,
              room_id: roomId,
              phase_id: phaseId,
              mode: "duration",
              date,
              duration_minutes: Number(durationMinutes) || 0,
              note: note.trim() ? note : undefined,
            });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(bg.workSessionManual.logSuccess);
      resetForm();
      onOpenChange(false);
      onSaved();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>{bg.workSessionManual.logDialogTitle}</DialogTitle>
          <DialogDescription>{bg.workSessionManual.logDialogDescription}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="manual-work-date">{bg.workSessionManual.date}</Label>
            <Input
              id="manual-work-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={mode === "range" ? "default" : "outline"}
              onClick={() => setMode("range")}
              disabled={isPending}
            >
              {bg.workSessionManual.timeRangeMode}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "duration" ? "default" : "outline"}
              onClick={() => setMode("duration")}
              disabled={isPending}
            >
              {bg.workSessionManual.durationMode}
            </Button>
          </div>

          {mode === "range" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="manual-work-start">{bg.workSessionManual.startTime}</Label>
                <Input
                  id="manual-work-start"
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  disabled={isPending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="manual-work-end">{bg.workSessionManual.endTime}</Label>
                <Input
                  id="manual-work-end"
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  disabled={isPending}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="manual-work-duration">{bg.workSessionManual.durationMinutes}</Label>
              <Input
                id="manual-work-duration"
                type="number"
                min="1"
                step="1"
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(event.target.value)}
                disabled={isPending}
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="manual-work-note">{bg.workSessionManual.notes}</Label>
            <Textarea
              id="manual-work-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
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
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending ? bg.workSessionManual.saving : bg.workSessionManual.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
