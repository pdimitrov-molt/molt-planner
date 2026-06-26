import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { StudioDashboard } from "@/features/studio-dashboard/components/studio-dashboard";
import { buildStudioDashboard } from "@/features/studio-dashboard/lib/build-studio-dashboard";
import { getProjectService } from "@/features/projects/service/get-project-service";
import { getProjectWorkspaceService } from "@/features/projects/service/project-workspace.service";
import type { ProjectWorkspace } from "@/features/projects/types/project-workspace";
import { bg } from "@/src/i18n/bg";

export default async function HomePage() {
  const projectService = await getProjectService();
  const workspaceService = await getProjectWorkspaceService();

  const projects = await projectService.listProjectsWithClient();
  const visibleProjects = projects.filter(
    (project) => project.engagement_status !== "archived"
  );

  const workspaces = await Promise.all(
    visibleProjects.map((project) =>
      workspaceService.getProjectWorkspace(project.id)
    )
  ).then((results) =>
    results.filter((workspace): workspace is ProjectWorkspace => workspace !== null)
  );

  const view = buildStudioDashboard({
    projects: visibleProjects,
    workspaces,
  });

  return (
    <main className="min-h-screen">
      <PageShell>
        <PageHeader
          title={bg.studioDashboard.title}
          description={bg.studioDashboard.subtitle}
        />

        <StudioDashboard view={view} />
      </PageShell>
    </main>
  );
}
