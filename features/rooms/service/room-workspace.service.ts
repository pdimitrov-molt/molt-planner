import { RoomWorkspaceRepository } from "@/features/rooms/repository/room-workspace.repository";
import type { RoomWorkspace } from "@/features/rooms/repository/room-workspace.repository";
import { getCachedSupabaseServerClient } from "@/lib/server/request-cache";

export class RoomWorkspaceService {
  constructor(private readonly repository: RoomWorkspaceRepository) {}

  async getRoomWorkspace(
    projectId: string,
    roomId: string
  ): Promise<RoomWorkspace | null> {
    return this.repository.findRoomWorkspace(projectId, roomId);
  }
}

export async function getRoomWorkspaceService(): Promise<RoomWorkspaceService> {
  const database = await getCachedSupabaseServerClient();
  return new RoomWorkspaceService(new RoomWorkspaceRepository(database));
}
