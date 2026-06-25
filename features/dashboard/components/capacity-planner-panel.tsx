import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { StudioCapacityPlan } from "@/features/planner/types/capacity-plan";
import { calculateLoad } from "@/features/planner/capacity";
import { bg } from "@/src/i18n/bg";

interface CapacityPlannerPanelProps {
  plan: StudioCapacityPlan;
}

export function CapacityPlannerPanel({ plan }: CapacityPlannerPanelProps) {
  const loadPercent = calculateLoad(
    plan.remaining_hours,
    plan.weekly_capacity_hours
  );

  return (
    <Card>
      <CardHeader className="gap-3 pb-2">
        <CardTitle className="text-2xl">{bg.capacity.title}</CardTitle>
        <CardDescription className="text-base">
          {bg.capacity.subtitle(plan.active_project_count)}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-8 pt-2">
        <div className="grid gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {bg.capacity.remainingWorkload}
            </span>
            <span className="font-medium">{plan.remaining_hours}ч</span>
          </div>
          <Progress value={Math.min(loadPercent, 100)} />
          <p className="text-sm text-muted-foreground">
            {plan.remaining_hours_label} · {loadPercent}
            {bg.common.perStudioWeek}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label={bg.capacity.remainingHours}
            value={`${plan.remaining_hours}ч`}
            detail={plan.remaining_hours_label}
          />
          <MetricCard
            label={bg.capacity.weeklyCapacity}
            value={`${plan.weekly_capacity_hours}ч`}
            detail={plan.weekly_capacity_label}
          />
          <MetricCard
            label={bg.capacity.estimatedCompletion}
            value={plan.estimated_completion_label}
            detail={
              plan.remaining_hours > 0
                ? bg.capacity.studioWeekDetail(
                    plan.weeks_to_complete,
                    plan.working_days_to_complete
                  )
                : bg.capacity.allPhasesComplete
            }
          />
          <MetricCard
            label={bg.capacity.nextProjectStart}
            value={plan.earliest_next_project_start_label}
            detail={
              plan.remaining_hours > 0
                ? bg.capacity.earliestNewEngagement
                : bg.capacity.bandwidthOpen
            }
          />
        </div>
      </CardContent>
    </Card>
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
    <div className="surface-inset">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-lg font-semibold">{value}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {detail}
      </p>
    </div>
  );
}
