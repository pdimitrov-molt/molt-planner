import { PageShell } from "@/components/layout/page-shell";
import { InboxDashboard } from "@/features/inbox/components/inbox-dashboard";
import { collectPausedWorkflowSessions } from "@/features/planning-engine/lib/collect-paused-workflow-sessions";
import { listPersonalItems } from "@/features/personal-items/service/get-personal-item-service";
import {
  filterActiveProjects,
  filterVisibleProjects,
  loadActiveWaitingEvents,
  loadProjectsWithClient,
  loadStudioProjectContext,
} from "@/features/studio-data/lib/load-studio-data";
import { buildInboxViewCached } from "@/lib/server/memo-builders";
import { getWorkSessionService } from "@/features/work-sessions/service/get-work-session-service";

export default async function InboxPage() {
  const [projects, workSessionService, activeWaitingEvents, personalItems] =
    await Promise.all([
      loadProjectsWithClient(),
      getWorkSessionService(),
      loadActiveWaitingEvents(),
      listPersonalItems(),
    ]);

  const visibleProjects = filterVisibleProjects(projects);
  const visibleProjectIds = visibleProjects.map((project) => project.id);
  const activeProjects = filterActiveProjects(visibleProjects);

  const [{ workflows }, continueWorking] = await Promise.all([
    loadStudioProjectContext({
      workspaceProjectIds: [],
      workflowProjectIds: visibleProjectIds,
    }),
    workSessionService.getContinueWorking(),
  ]);

  const pausedSessions = await collectPausedWorkflowSessions({
    projects: activeProjects,
    workflows,
  });

  const view = buildInboxViewCached({
    projects: visibleProjects,
    workflows,
    activeWaitingEvents,
    personalItems,
    continueWorking,
    pausedSessions,
  });

  return (
    <main className="min-h-screen">
      <PageShell width="lg">
        <InboxDashboard view={view} />
      </PageShell>
    </main>
  );
}
