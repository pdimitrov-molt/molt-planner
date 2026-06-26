import { buildActionCenter } from "@/features/dashboard/lib/build-action-center";
import type {
  ActionCenterView,
  PausedWorkSessionItem,
} from "@/features/dashboard/lib/build-action-center";
import { getProjectService } from "@/features/projects/service/get-project-service";
import { getProjectWorkspaceService } from "@/features/projects/service/project-workspace.service";
import type { ProjectWorkspace } from "@/features/projects/types/project-workspace";
import { getWorkSessionService } from "@/features/work-sessions/service/get-work-session-service";

export class ActionCenterService {
  async getActionCenterView(): Promise<ActionCenterView> {
    const projectService = await getProjectService();
    const workspaceService = await getProjectWorkspaceService();
    const workSessionService = await getWorkSessionService();

    const projects = await projectService.listProjectsWithClient();
    const activeProjects = projects.filter(
      (project) => project.engagement_status === "active"
    );

    const [continueWorking, runningSession, workspaces] = await Promise.all([
      workSessionService.getContinueWorking(),
      workSessionService.findRunningSession(),
      Promise.all(
        activeProjects.map((project) =>
          workspaceService.getProjectWorkspace(project.id)
        )
      ).then((results) =>
        results.filter((workspace): workspace is ProjectWorkspace => workspace !== null)
      ),
    ]);

    const pausedSessions = await collectPausedSessions(
      workspaces,
      workSessionService
    );

    return buildActionCenter({
      workspaces,
      projects: activeProjects,
      continueWorking,
      runningSession,
      pausedSessions,
    });
  }
}

async function collectPausedSessions(
  workspaces: ProjectWorkspace[],
  workSessionService: Awaited<ReturnType<typeof getWorkSessionService>>
): Promise<PausedWorkSessionItem[]> {
  const pausedSessions: PausedWorkSessionItem[] = [];

  await Promise.all(
    workspaces.flatMap((workspace) =>
      workspace.rooms.map(async (room) => {
        const currentPhase = room.phases.find((phase) => phase.is_current);

        if (!currentPhase) {
          return;
        }

        const sessions = await workSessionService.findByPhase({
          phase_id: currentPhase.id,
        });
        const pausedSession = sessions.find((session) => session.status === "paused");

        if (!pausedSession) {
          return;
        }

        pausedSessions.push({
          session_id: pausedSession.id,
          project_id: workspace.id,
          project_name: workspace.name,
          room_id: room.id,
          room_name: room.name,
          phase_id: currentPhase.id,
          phase_label: currentPhase.label,
        });
      })
    )
  );

  return pausedSessions;
}

export async function getActionCenterService(): Promise<ActionCenterService> {
  return new ActionCenterService();
}
