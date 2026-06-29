"use client";

import { getWaitingReasonLabel } from "@/features/workflow-engine/lib/waiting-reason-labels";
import { calculateWaitingDurationMinutes } from "@/features/workflow-engine/lib/calculate-waiting-duration";
import type { WorkflowWaitingEvent } from "@/features/workflow-engine/types/workflow-waiting-event";
import { formatWorkDurationMinutes } from "@/features/work-sessions/lib/format-work-duration";
import { formatLongDate } from "@/src/i18n/format";
import { bg } from "@/src/i18n/bg";

interface StageWaitingHistoryProps {
  entries: WorkflowWaitingEvent[];
}

export function StageWaitingHistory({ entries }: StageWaitingHistoryProps) {
  const historyEntries = entries.filter(
    (entry) => entry.status === "COMPLETED" || entry.status === "CANCELLED"
  );

  if (historyEntries.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border/60 px-3 py-4 text-sm text-muted-foreground">
        {bg.workflowWaiting.historyEmpty}
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {historyEntries.map((entry) => {
        const durationMinutes = calculateWaitingDurationMinutes(entry);
        const reasonLabel = getWaitingReasonLabel(entry.reason, entry.custom_reason);

        return (
          <article
            key={entry.id}
            className="grid gap-2 rounded-xl border border-border/50 bg-muted/20 p-3 text-sm"
          >
            <HistoryRow label={bg.workflowWaiting.reasonLabel} value={reasonLabel} />
            <HistoryRow
              label={bg.workflowWaiting.startedAtLabel}
              value={formatLongDate(entry.started_at)}
            />
            {entry.ended_at ? (
              <HistoryRow
                label={bg.workflowWaiting.endedAtLabel}
                value={formatLongDate(entry.ended_at)}
              />
            ) : null}
            {durationMinutes !== null ? (
              <HistoryRow
                label={bg.workflowWaiting.durationLabel}
                value={formatWorkDurationMinutes(durationMinutes)}
              />
            ) : null}
            {entry.notes ? (
              <HistoryRow label={bg.workflowWaiting.notesLabel} value={entry.notes} />
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function HistoryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
