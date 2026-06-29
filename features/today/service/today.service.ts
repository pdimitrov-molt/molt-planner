import { buildTodayView } from "@/features/today/lib/build-today-view";
import type { TodayView } from "@/features/today/types/today-view";
import { getPlannerService } from "@/features/planner/service/planner.service";
import { loadProjectWorkspaces } from "@/features/projects/service/project-workspace.service";
import {
  filterActiveProjects,
  loadProjectsWithClient,
} from "@/features/studio-data/lib/load-studio-data";

export class TodayService {
  async getTodayView(): Promise<TodayView> {
    const [projects, plannerService] = await Promise.all([
      loadProjectsWithClient(),
      getPlannerService(),
    ]);

    const activeProjects = filterActiveProjects(projects);
    const activeProjectIds = activeProjects.map((project) => project.id);

    const [workspaces, capacityPlan] = await Promise.all([
      loadProjectWorkspaces(activeProjectIds),
      plannerService.getStudioCapacityPlan(),
    ]);

    return buildTodayView({
      workspaces,
      capacityPlan,
    });
  }
}

export async function getTodayService(): Promise<TodayService> {
  return new TodayService();
}
