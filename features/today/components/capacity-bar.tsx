import { InsetPanel, SurfaceCard } from "@/components/layout/page-shell";
import { Progress } from "@/components/ui/progress";
import type { TodayCapacitySummary } from "@/features/today/types/today-view";
import { bg } from "@/src/i18n/bg";

interface CapacityBarProps {
  capacity: TodayCapacitySummary;
}

export function CapacityBar({ capacity }: CapacityBarProps) {
  const progressValue = Math.min(capacity.load_percent, 100);

  return (
    <SurfaceCard className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-title">{bg.today.capacity.title}</h2>
        <p className="text-body">
          {bg.today.capacity.studioRemaining(capacity.studio_remaining_hours)}
        </p>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{bg.today.capacity.planned}</span>
          <span className="font-medium">{capacity.planned_hours}ч</span>
        </div>
        <Progress value={progressValue} />
        <p className="text-sm text-muted-foreground">
          {bg.today.capacity.loadLabel(capacity.load_percent)}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Metric
          label={bg.today.capacity.available}
          value={`${capacity.available_hours}ч`}
        />
        <Metric
          label={bg.today.capacity.dailyLimit}
          value={`${capacity.daily_capacity_hours}ч`}
        />
      </div>

      {capacity.is_over_capacity ? (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {bg.today.capacity.overCapacity}
        </p>
      ) : null}
    </SurfaceCard>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <InsetPanel className="p-4">
      <p className="text-eyebrow">{label}</p>
      <p className="mt-2 text-section-title">{value}</p>
    </InsetPanel>
  );
}
