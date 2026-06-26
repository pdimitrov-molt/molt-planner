import { SurfaceCard } from "@/components/layout/page-shell";
import { Progress } from "@/components/ui/progress";
import type { StudioProgressSummary } from "@/features/progress/types/progress";
import { bg } from "@/src/i18n/bg";

interface DashboardProgressPanelProps {
  summary: StudioProgressSummary;
}

export function DashboardProgressPanel({ summary }: DashboardProgressPanelProps) {
  return (
    <SurfaceCard className="rounded-2xl shadow-sm">
      <div className="flex flex-col gap-8">
        <div className="grid gap-2">
          <h2 className="text-title">{bg.progress.dashboardTitle}</h2>
          <p className="text-body">{bg.progress.dashboardSubtitle}</p>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{bg.progress.overallProgress}</span>
            <span className="text-lg font-semibold tabular-nums">
              {summary.overall_progress_percent}%
            </span>
          </div>
          <Progress value={summary.overall_progress_percent} className="h-3" />
          <p className="text-sm text-muted-foreground">
            {bg.progress.phaseCount(summary.completed_phases, summary.total_phases)}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            label={bg.progress.projectsInProgress}
            value={String(summary.projects_in_progress)}
          />
          <MetricCard
            label={bg.progress.roomsCompletedToday}
            value={String(summary.rooms_completed_today)}
          />
          <MetricCard
            label={bg.progress.hoursWorkedToday}
            value={summary.hours_worked_today_label}
          />
        </div>
      </div>
    </SurfaceCard>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-inset">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
