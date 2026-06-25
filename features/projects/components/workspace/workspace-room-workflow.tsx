import { StarIcon } from "lucide-react";

import type { ProjectWorkspace } from "@/features/projects/types/project-workspace";
import { RoomWorkflowCard } from "@/features/projects/components/workspace/room-workflow-card";
import { bg } from "@/src/i18n/bg";

interface WorkspaceRoomWorkflowProps {
  projectId: string;
  workspace: ProjectWorkspace;
}

export function WorkspaceRoomWorkflow({
  projectId,
  workspace,
}: WorkspaceRoomWorkflowProps) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-title">{bg.projects.workspace.rooms.title}</h2>
        <p className="max-w-2xl text-body">{bg.projects.workspace.rooms.subtitle}</p>
      </div>

      {workspace.focus_room_name ? (
        <div className="surface-inset flex items-center gap-2 text-sm text-primary">
          <StarIcon className="size-4 shrink-0" />
          <span>{bg.projects.workspace.rooms.focusRoom(workspace.focus_room_name)}</span>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {workspace.rooms.map((room) => (
          <RoomWorkflowCard key={room.id} projectId={projectId} room={room} />
        ))}
      </div>
    </section>
  );
}
