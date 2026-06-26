import { SurfaceCard } from "@/components/layout/page-shell";
import type { TodayWorkSessionEntry } from "@/features/work-sessions/types/work-session-log";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

interface DailyWorkLogPanelProps {
  entries: TodayWorkSessionEntry[];
}

export function DailyWorkLogPanel({ entries }: DailyWorkLogPanelProps) {
  return (
    <SurfaceCard className="rounded-2xl shadow-sm">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-title">{bg.workSessionLog.todayTitle}</h2>
          <p className="text-body">{bg.workSessionLog.todaySubtitle}</p>
        </div>

        {entries.length === 0 ? (
          <p className="rounded-2xl bg-muted/40 px-5 py-6 text-body">
            {bg.workSessionLog.empty}
          </p>
        ) : (
          <div className="grid gap-0">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={cn(
                  "grid gap-4 py-5 sm:grid-cols-[minmax(0,7rem)_minmax(0,1fr)_auto]",
                  index > 0 && "border-t border-border/40"
                )}
              >
                <div className="text-sm font-medium tabular-nums text-muted-foreground">
                  {entry.time_range_label}
                </div>

                <div className="grid gap-1">
                  <p className="text-section-title">{entry.project_name}</p>
                  <p className="text-body">
                    {entry.room_name}
                    <span className="text-muted-foreground"> · </span>
                    {entry.phase_label}
                  </p>
                </div>

                <div className="self-start text-right">
                  <p
                    className={cn(
                      "text-section-title tabular-nums",
                      entry.status === "running" &&
                        "text-emerald-700 dark:text-emerald-300"
                    )}
                  >
                    {entry.worked_duration_label}
                  </p>
                  {entry.status === "running" ? (
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      {bg.workSessionLog.runningNow}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SurfaceCard>
  );
}
