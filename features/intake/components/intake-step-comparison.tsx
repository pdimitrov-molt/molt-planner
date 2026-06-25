"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  IntakeSimulationResult,
  IntakeStudioContext,
  ScheduleFitStatus,
} from "@/features/intake/types/intake-plan";
import { bg } from "@/src/i18n/bg";
import { cn } from "@/lib/utils";

interface IntakeStepComparisonProps {
  result: IntakeSimulationResult;
  studio: IntakeStudioContext;
}

const STATUS_STYLES: Record<
  ScheduleFitStatus,
  { badge: "default" | "secondary" | "destructive"; panel: string }
> = {
  green: {
    badge: "default",
    panel: "border-emerald-500/40 bg-emerald-500/5",
  },
  yellow: {
    badge: "secondary",
    panel: "border-amber-500/40 bg-amber-500/5",
  },
  red: {
    badge: "destructive",
    panel: "border-destructive/40 bg-destructive/5",
  },
};

export function IntakeStepComparison({
  result,
  studio,
}: IntakeStepComparisonProps) {
  const { schedule_fit: fit } = result;
  const styles = STATUS_STYLES[fit.status];

  return (
    <div className="grid gap-8">
      <div className={cn("surface-card p-6", styles.panel)}>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={styles.badge}>{bg.labels.scheduleFit[fit.status]}</Badge>
          <p className="text-section-title">{fit.headline}</p>
        </div>
        <p className="mt-4 text-body">{fit.detail}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <ComparisonCard
          label={bg.intake.comparison.currentWorkload}
          value={`${fit.current_remaining_hours}${bg.common.hoursShort}`}
          detail={bg.intake.comparison.activeProjectsBacklog(
            studio.active_project_count,
            fit.studio_backlog_weeks_before
          )}
        />
        <ComparisonCard
          label={bg.intake.comparison.afterAdding}
          value={`${fit.combined_remaining_hours}${bg.common.hoursShort}`}
          detail={bg.intake.comparison.pipelineWeeks(fit.combined_pipeline_weeks)}
        />
        <ComparisonCard
          label={bg.intake.comparison.parallelImpact}
          value={
            fit.parallel_delay_weeks > 0
              ? bg.intake.comparison.delayWeeks(fit.parallel_delay_weeks)
              : bg.intake.comparison.noDelay
          }
          detail={
            fit.parallel_delay_weeks > 0
              ? bg.intake.comparison.parallelSlip
              : bg.intake.comparison.sequentialPreserves
          }
        />
        <ComparisonCard
          label={bg.intake.comparison.recommendedStart}
          value={result.estimate.earliest_available_start_label}
          detail={bg.intake.comparison.earliestSlot}
        />
      </div>

      <div className="surface-panel flex flex-wrap gap-4 p-6">
        <p className="w-full text-body">
          {bg.intake.comparison.simulationNote}
        </p>
        <Button asChild>
          <Link href="/projects/new">{bg.intake.comparison.createProject}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">{bg.intake.comparison.backToDashboard}</Link>
        </Button>
      </div>
    </div>
  );
}

function ComparisonCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="surface-card p-5">
      <p className="text-eyebrow">{label}</p>
      <p className="mt-3 text-section-title">{value}</p>
      <p className="mt-3 text-body">{detail}</p>
    </div>
  );
}
