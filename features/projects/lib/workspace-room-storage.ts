const STORAGE_PREFIX = "molt-workspace-expanded-room";

export function getExpandedRoomStorageKey(projectId: string): string {
  return `${STORAGE_PREFIX}:${projectId}`;
}

export function readExpandedRoomId(projectId: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(getExpandedRoomStorageKey(projectId));
}

export function writeExpandedRoomId(projectId: string, roomId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(getExpandedRoomStorageKey(projectId), roomId);
}
