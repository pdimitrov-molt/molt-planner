"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import type { PhaseWorkSessionHistoryEntry } from "@/features/work-sessions/types/work-session-log";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

interface PhaseWorkSessionHistoryProps {
  entries: PhaseWorkSessionHistoryEntry[];
}

export function PhaseWorkSessionHistory({ entries }: PhaseWorkSessionHistoryProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 grid gap-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {bg.workSessionLog.historyTitle}
      </p>
      <div className="grid gap-2">
        {entries.map((entry) => (
          <PhaseWorkSessionHistoryItem key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}

function PhaseWorkSessionHistoryItem({
  entry,
}: {
  entry: PhaseWorkSessionHistoryEntry;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = Boolean(entry.note || entry.next_step || entry.blocker);

  return (
    <div className="rounded-2xl bg-muted/40 shadow-sm">
      <button
        type="button"
        className={cn(
          "flex w-full items-start justify-between gap-3 px-4 py-3 text-left",
          hasDetails && "cursor-pointer"
        )}
        onClick={() => {
          if (hasDetails) {
            setExpanded((value) => !value);
          }
        }}
        disabled={!hasDetails}
      >
        <div className="grid gap-1">
          <p className="text-sm font-medium">{entry.date_label}</p>
          <p className="text-sm text-muted-foreground tabular-nums">
            {entry.worked_duration_label}
          </p>
        </div>
        {hasDetails ? (
          <ChevronDown
            className={cn(
              "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform",
              expanded && "rotate-180"
            )}
          />
        ) : null}
      </button>

      {expanded && hasDetails ? (
        <div className="grid gap-3 border-t border-border/40 px-4 py-3 text-sm">
          {entry.note ? (
            <HistoryDetail label={bg.workSession.fields.completedWork} value={entry.note} />
          ) : null}
          {entry.next_step ? (
            <HistoryDetail label={bg.workSession.fields.nextStep} value={entry.next_step} />
          ) : null}
          {entry.blocker ? (
            <HistoryDetail label={bg.workSession.fields.blocker} value={entry.blocker} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function HistoryDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-body whitespace-pre-wrap">{value}</p>
    </div>
  );
}
