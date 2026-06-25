import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { CapacityPlannerPanel } from "@/features/dashboard/components/capacity-planner-panel";
import { getPlannerService } from "@/features/planner/service/planner.service";
import { getProjectService } from "@/features/projects/service/get-project-service";
import { ProjectTable } from "@/features/projects/components/project-table";
import { bg } from "@/src/i18n/bg";

export async function Dashboard() {
  const projectService = await getProjectService();
  const plannerService = await getPlannerService();
  const [projects, capacityPlan] = await Promise.all([
    projectService.listProjectsWithClient(),
    plannerService.getStudioCapacityPlan(),
  ]);

  return (
    <main className="min-h-screen">
      <PageShell>
        <PageHeader
          title={bg.dashboard.title}
          description={bg.dashboard.subtitle}
        />

        <CapacityPlannerPanel plan={capacityPlan} />

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
