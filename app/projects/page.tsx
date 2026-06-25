import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { NewProjectLink } from "@/features/projects/components/new-project-link";
import { ProjectTable } from "@/features/projects/components/project-table";
import { getProjectService } from "@/features/projects/service/get-project-service";
import { bg } from "@/src/i18n/bg";

export default async function ProjectsPage() {
  const projectService = await getProjectService();
  const projects = await projectService.listProjectsWithClient();

  return (
    <main className="min-h-screen">
      <PageShell>
        <PageHeader
          title={bg.projects.title}
          description={bg.projects.subtitle}
          action={<NewProjectLink />}
        />

        <Card>
          <CardHeader>
            <CardTitle>{bg.dashboard.activeProjects}</CardTitle>
            <CardDescription>
              {projects.length === 0
                ? bg.dashboard.emptyPipeline
                : bg.dashboard.projectCount(projects.length)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectTable projects={projects} />
          </CardContent>
        </Card>
      </PageShell>
    </main>
  );
}
