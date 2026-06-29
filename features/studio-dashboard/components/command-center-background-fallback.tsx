import { DashboardPanel } from "@/features/studio-dashboard/components/dashboard-ui";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

function PulseBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted/50", className)} aria-hidden />;
}

export function CommandCenterHealthFallback() {
  return (
    <DashboardPanel title={bg.commandCenter.studioHealth.title} plainHeader className="gap-4 p-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <PulseBlock key={index} className="h-[5.5rem]" />
        ))}
      </div>
    </DashboardPanel>
  );
}

export function CommandCenterSidebarFallback() {
  return (
    <div className="grid min-w-0 content-start gap-5">
      <DashboardPanel title={bg.commandCenter.studioTimeline.title} plainHeader>
        <PulseBlock className="h-48" />
      </DashboardPanel>
      <DashboardPanel title={bg.commandCenter.capacity.title} plainHeader>
        <div className="grid gap-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <PulseBlock key={index} className="h-28" />
          ))}
        </div>
      </DashboardPanel>
      <DashboardPanel title={bg.commandCenter.upcomingEvents.title} plainHeader>
        <PulseBlock className="h-32" />
      </DashboardPanel>
    </div>
  );
}
