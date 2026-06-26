import { SurfaceCard } from "@/components/layout/page-shell";
import type { TodayWorkSummary } from "@/features/work-sessions/types/work-session-log";
import { bg } from "@/src/i18n/bg";

interface DailyWorkSummaryCardProps {
  summary: TodayWorkSummary;
}

export function DailyWorkSummaryCard({ summary }: DailyWorkSummaryCardProps) {
  return (
    <SurfaceCard className="min-w-56 rounded-2xl bg-muted/40 p-5 shadow-sm">
      <div className="grid gap-4">
        <p className="text-eyebrow">{bg.workSessionLog.summaryTitle}</p>
        <div className="grid gap-1">
          <span className="text-sm text-muted-foreground">
            {bg.workSessionLog.summaryTotal}
          </span>
          <span className="text-2xl font-semibold tracking-tight tabular-nums">
            {summary.total_label}
          </span>
        </div>
        <div className="grid gap-1 text-sm text-body">
          <span>{summary.completed_label}</span>
          <span>{summary.running_label}</span>
        </div>
      </div>
    </SurfaceCard>
  );
}
