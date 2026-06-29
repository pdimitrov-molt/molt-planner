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
import { updateManualWorkSessionAction } from "@/features/work-sessions/actions/work-session.actions";
import type { PhaseWorkSessionHistoryEntry } from "@/features/work-sessions/types/work-session-log";
import { bg } from "@/src/i18n/bg";

interface EditWorkSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: PhaseWorkSessionHistoryEntry | null;
  onSaved: () => void;
}

type EditMode = "range" | "duration";

function toDateValue(iso: string): string {
  return iso.slice(0, 10);
}

function toTimeValue(iso: string): string {
  const date = new Date(iso);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function EditWorkSessionDialog({
  open,
  onOpenChange,
  entry,
  onSaved,
}: EditWorkSessionDialogProps) {
  const [mode, setMode] = useState<EditMode>("range");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!entry || !open) {
      return;
    }

    setDate(toDateValue(entry.started_at));
    setStartTime(toTimeValue(entry.started_at));
    setEndTime(entry.ended_at ? toTimeValue(entry.ended_at) : toTimeValue(entry.started_at));
    setDurationMinutes(String(entry.duration_minutes));
    setNote(entry.note ?? "");
    setMode("range");
  }, [entry, open]);

  function handleSubmit() {
    if (!entry) {
      return;
    }

    startTransition(async () => {
      const result =
        mode === "range"
          ? await updateManualWorkSessionAction({
              id: entry.id,
              mode: "range",
              date,
              start_time: startTime,
              end_time: endTime,
              note: note.trim() ? note : undefined,
            })
          : await updateManualWorkSessionAction({
              id: entry.id,
              mode: "duration",
              date,
              duration_minutes: Number(durationMinutes) || 0,
              note: note.trim() ? note : undefined,
            });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(bg.workSessionManual.updateSuccess);
      onOpenChange(false);
      onSaved();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>{bg.workSessionManual.editDialogTitle}</DialogTitle>
          <DialogDescription>{bg.workSessionManual.editDialogDescription}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-work-date">{bg.workSessionManual.date}</Label>
            <Input
              id="edit-work-date"
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
                <Label htmlFor="edit-work-start">{bg.workSessionManual.startTime}</Label>
                <Input
                  id="edit-work-start"
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  disabled={isPending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-work-end">{bg.workSessionManual.endTime}</Label>
                <Input
                  id="edit-work-end"
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  disabled={isPending}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="edit-work-duration">{bg.workSessionManual.durationMinutes}</Label>
              <Input
                id="edit-work-duration"
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
            <Label htmlFor="edit-work-note">{bg.workSessionManual.notes}</Label>
            <Textarea
              id="edit-work-note"
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
            onClick={() => onOpenChange(false)}
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
