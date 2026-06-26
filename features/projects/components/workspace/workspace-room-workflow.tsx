import { StarIcon } from "lucide-react";

import type { ProjectWorkspace } from "@/features/projects/types/project-workspace";
import { WorkspaceRoomAccordion } from "@/features/projects/components/workspace/workspace-room-accordion";
import { getActivePhaseSession } from "@/features/work-sessions/lib/get-active-phase-session";
import { getWorkSessionService } from "@/features/work-sessions/service/get-work-session-service";
import type { WorkSession } from "@/features/work-sessions/types/work-session";
import { bg } from "@/src/i18n/bg";

interface WorkspaceRoomWorkflowProps {
  projectId: string;
  workspace: ProjectWorkspace;
}

function resolveCurrentPhaseId(room: ProjectWorkspace["rooms"][number]): string | null {
  return (
    room.phases.find((phase) => phase.is_current)?.id ??
    room.phases.find((phase) => phase.status === "in_progress")?.id ??
    null
  );
}

export async function WorkspaceRoomWorkflow({
  projectId,
  workspace,
}: WorkspaceRoomWorkflowProps) {
  const workSessionService = await getWorkSessionService();
  const runningSession = await workSessionService.findRunningSession();

  const roomCurrentPhaseSessions = new Map<string, WorkSession | null>();

  await Promise.all(
    workspace.rooms.map(async (room) => {
      const currentPhaseId = resolveCurrentPhaseId(room);

      if (!currentPhaseId) {
        roomCurrentPhaseSessions.set(room.id, null);
        return;
      }

      const sessions = await workSessionService.findByPhase({
        phase_id: currentPhaseId,
      });

      roomCurrentPhaseSessions.set(room.id, getActivePhaseSession(sessions));
    })
  );

  const sortedRooms = [...workspace.rooms].sort((left, right) => {
    if (left.is_focus !== right.is_focus) {
      return left.is_focus ? -1 : 1;
    }

    return 0;
  });

  return (
    <section className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-title">{bg.projects.workspace.rooms.title}</h2>
        <p className="max-w-2xl text-body">{bg.projects.workspace.rooms.subtitle}</p>
      </div>

      {workspace.focus_room_name ? (
        <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
          <StarIcon className="size-4 shrink-0" />
          <span>{bg.projects.workspace.rooms.focusRoom(workspace.focus_room_name)}</span>
        </div>
      ) : null}

      <WorkspaceRoomAccordion
        projectId={projectId}
        rooms={sortedRooms}
        runningSession={runningSession}
        roomCurrentPhaseSessions={Object.fromEntries(roomCurrentPhaseSessions)}
      />
    </section>
  );
}
