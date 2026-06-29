import { StudioContinueWorkingSection } from "@/features/studio-dashboard/components/studio-continue-working-section";
import { StudioProjectList } from "@/features/studio-dashboard/components/studio-project-list";
import { StudioSummaryCards } from "@/features/studio-dashboard/components/studio-summary-cards";
import { StudioPrioritySections } from "@/features/studio-dashboard/components/studio-priority-sections";
import type { StudioDashboardView } from "@/features/studio-dashboard/types/studio-dashboard-view";

interface StudioDashboardProps {
  view: StudioDashboardView;
}

export function StudioDashboard({ view }: StudioDashboardProps) {
  return (
    <div className="grid gap-6">
      {view.continueWorking ? (
        <StudioContinueWorkingSection context={view.continueWorking} />
      ) : null}
      <StudioPrioritySections sections={view.prioritySections} />
      <StudioSummaryCards cards={view.summary} />
      <StudioProjectList projects={view.projects} />
    </div>
  );
}
