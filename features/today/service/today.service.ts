import { buildTodayView } from "@/features/today/lib/build-today-view";
import type { TodayView } from "@/features/today/types/today-view";
import { getPlannerService } from "@/features/planner/service/planner.service";
import { getProjectService } from "@/features/projects/service/get-project-service";
import { getProjectWorkspaceService } from "@/features/projects/service/project-workspace.service";
import type { ProjectWorkspace } from "@/features/projects/types/project-workspace";

export class TodayService {
  async getTodayView(): Promise<TodayView> {
    const projectService = await getProjectService();
    const workspaceService = await getProjectWorkspaceService();
    const plannerService = await getPlannerService();

    const [projects, capacityPlan] = await Promise.all([
      projectService.listProjectsWithClient(),
      plannerService.getStudioCapacityPlan(),
    ]);

    const activeProjects = projects.filter(
      (project) => project.engagement_status === "active"
    );

    const workspaces = (
      await Promise.all(
        activeProjects.map((project) =>
          workspaceService.getProjectWorkspace(project.id)
        )
      )
    ).filter((workspace): workspace is ProjectWorkspace => workspace !== null);

    return buildTodayView({
      workspaces,
      capacityPlan,
    });
  }
}

export async function getTodayService(): Promise<TodayService> {
  return new TodayService();
}
