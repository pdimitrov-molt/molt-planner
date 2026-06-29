import { PageShell } from "@/components/layout/page-shell";
import { DailyScheduleDashboard } from "@/features/today/components/daily-schedule-dashboard";
import { listPersonalItems } from "@/features/personal-items/service/get-personal-item-service";
import {
  filterActiveProjects,
  filterVisibleProjects,
  loadActiveWaitingEvents,
  loadProjectsWithClient,
  loadStudioProjectContext,
} from "@/features/studio-data/lib/load-studio-data";
import { buildDailyScheduleViewCached } from "@/lib/server/memo-builders";

export default async function TodayPage() {
  const [projects, activeWaitingEvents, personalItems] = await Promise.all([
    loadProjectsWithClient(),
    loadActiveWaitingEvents(),
    listPersonalItems(),
  ]);

  const visibleProjects = filterVisibleProjects(projects);
  const activeProjects = filterActiveProjects(visibleProjects);
  const activeProjectIds = activeProjects.map((project) => project.id);
  const visibleProjectIds = visibleProjects.map((project) => project.id);

  const { workspaces, workflows } = await loadStudioProjectContext({
    workspaceProjectIds: activeProjectIds,
    workflowProjectIds: visibleProjectIds,
  });

  const view = buildDailyScheduleViewCached({
    workspaces,
    personalItems,
    activeWaitingEvents,
    workflows,
  });

  return (
    <main className="min-h-screen">
      <PageShell width="lg">
        <DailyScheduleDashboard view={view} />
      </PageShell>
    </main>
  );
}
