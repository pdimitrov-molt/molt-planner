import type { ProjectWorkspace } from "@/features/projects/types/project-workspace";
import type { RoomWorkspaceItem } from "@/features/studio-workflow/types/workspace-item";

export function buildRoomWorkspaceItems(
  workspaces: ProjectWorkspace[]
): RoomWorkspaceItem[] {
  return workspaces.flatMap((workspace) =>
    workspace.rooms.flatMap((room) =>
      room.phases.map((phase) => ({
        scope: "room" as const,
        id: `room-${phase.id}`,
        project_id: workspace.id,
        project_name: workspace.name,
        room_id: room.id,
        room_name: room.name,
        phase_id: phase.id,
        label: phase.label,
        status: phase.status,
        target_end_date: phase.target_end_date,
        is_current: phase.is_current,
      }))
    )
  );
}

export function getCurrentRoomWorkspaceItems(
  items: RoomWorkspaceItem[]
): RoomWorkspaceItem[] {
  return items.filter(
    (item) =>
      item.is_current &&
      item.status !== "completed" &&
      item.status !== "blocked"
  );
}
