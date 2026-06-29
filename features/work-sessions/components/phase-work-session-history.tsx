"use client";

import { useState, useTransition } from "react";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EditWorkSessionDialog } from "@/features/work-sessions/components/edit-work-session-dialog";
import { deleteWorkSessionAction } from "@/features/work-sessions/actions/work-session.actions";
import type { PhaseWorkSessionHistoryEntry } from "@/features/work-sessions/types/work-session-log";
import { bg } from "@/src/i18n/bg";

interface PhaseWorkSessionHistoryProps {
  entries: PhaseWorkSessionHistoryEntry[];
  onChanged: () => void;
}

export function PhaseWorkSessionHistory({
  entries,
  onChanged,
}: PhaseWorkSessionHistoryProps) {
  const [editingEntry, setEditingEntry] = useState<PhaseWorkSessionHistoryEntry | null>(
    null
  );
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const totalMinutes = entries.reduce(
    (total, entry) => total + entry.duration_minutes,
    0
  );

  if (entries.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border/60 px-3 py-4 text-sm text-muted-foreground">
        {bg.workSessionManual.historyEmpty}
      </p>
    );
  }

  function handleEdit(entry: PhaseWorkSessionHistoryEntry) {
    setEditingEntry(entry);
    setEditOpen(true);
  }

  function handleDelete(entryId: string) {
    startTransition(async () => {
      const result = await deleteWorkSessionAction({ id: entryId });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(bg.workSessionManual.deleteSuccess);
      onChanged();
    });
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className="rounded-xl border border-border/50 bg-background/70 px-3 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="grid gap-1 text-sm">
                <p className="font-medium">{entry.date_label}</p>
                <p className="text-muted-foreground tabular-nums">{entry.time_range_label}</p>
                <p className="font-medium tabular-nums">{entry.worked_duration_label}</p>
                {entry.note ? (
                  <p className="text-muted-foreground">{entry.note}</p>
                ) : null}
              </div>

              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => handleEdit(entry)}
                  disabled={isPending}
                  aria-label={bg.workSessionManual.edit}
                >
                  <PencilIcon className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive"
                  onClick={() => handleDelete(entry.id)}
                  disabled={isPending}
                  aria-label={bg.workSessionManual.delete}
                >
                  <Trash2Icon className="size-3.5" />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border/50 pt-2 text-sm">
        <span className="text-muted-foreground">{bg.workSessionManual.totalWorked}</span>
        <span className="font-medium tabular-nums">
          {formatTotalWorked(totalMinutes)}
        </span>
      </div>

      <EditWorkSessionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        entry={editingEntry}
        onSaved={onChanged}
      />
    </div>
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
