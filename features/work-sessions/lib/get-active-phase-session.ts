import type { WorkSession } from "@/features/work-sessions/types/work-session";

export function getActivePhaseSession(
  sessions: WorkSession[]
): WorkSession | null {
  return (
    sessions.find(
      (session) => session.status === "running" || session.status === "paused"
    ) ?? null
  );
}
