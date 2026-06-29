import { PageShell } from "@/components/layout/page-shell";
import { DASHBOARD_PANEL_CLASS } from "@/features/studio-dashboard/components/dashboard-ui";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[1.125rem] bg-muted/40",
        className
      )}
    />
  );
}

export default function Loading() {
  return (
    <main className="min-h-screen">
      <PageShell width="full">
        <div className="grid gap-3">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-10 w-72 max-w-full" />
          <SkeletonBlock className="h-5 w-96 max-w-full" />
        </div>

        <p className="text-sm text-muted-foreground">{bg.commandCenter.loading}</p>

        <div className="grid gap-5">
          <SkeletonBlock className={cn(DASHBOARD_PANEL_CLASS, "h-28")} />

          <div className="grid gap-5 lg:grid-cols-[1.6fr_0.9fr]">
            <div className="grid content-start gap-5">
              <SkeletonBlock className={cn(DASHBOARD_PANEL_CLASS, "h-[32rem]")} />
              <SkeletonBlock className={cn(DASHBOARD_PANEL_CLASS, "h-72")} />
            </div>
            <div className="grid content-start gap-5">
              <SkeletonBlock className={cn(DASHBOARD_PANEL_CLASS, "h-64")} />
              <SkeletonBlock className={cn(DASHBOARD_PANEL_CLASS, "h-48")} />
              <SkeletonBlock className={cn(DASHBOARD_PANEL_CLASS, "h-52")} />
            </div>
          </div>
        </div>
      </PageShell>
    </main>
  );
}
