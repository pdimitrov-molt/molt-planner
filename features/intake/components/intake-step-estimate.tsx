"use client";

import type { IntakeSimulationResult } from "@/features/intake/types/intake-plan";
import { bg } from "@/src/i18n/bg";

interface IntakeStepEstimateProps {
  result: IntakeSimulationResult;
}

function formatDurationWeeks(weeks: number) {
  return `${weeks} ${weeks === 1 ? "седмица" : "седмици"}`;
}

export function IntakeStepEstimate({ result }: IntakeStepEstimateProps) {
  const { estimate } = result;

  return (
    <div className="grid gap-8">
      <div className="surface-panel p-6">
        <p className="font-medium">
          {bg.intake.estimate.title(result.project_type_label)}
        </p>
        <p className="text-sm text-muted-foreground">{result.scope_summary}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <MetricCard
          label={bg.intake.estimate.hours}
          value={`${estimate.estimated_hours}${bg.common.hoursShort}`}
          detail={bg.intake.estimate.roomDetail(estimate.room_count)}
        />
        <MetricCard
          label={bg.intake.estimate.duration}
          value={formatDurationWeeks(estimate.estimated_duration_weeks)}
          detail={bg.intake.estimate.durationHint}
        />
        <MetricCard
          label={bg.intake.estimate.earliestStart}
          value={estimate.earliest_available_start_label}
          detail={bg.intake.estimate.startHint}
        />
        <MetricCard
          label={bg.intake.estimate.completion}
          value={estimate.estimated_completion_label}
          detail={bg.intake.estimate.completionHint}
        />
      </div>
    </div>
  );
}

function MetricCard({
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
