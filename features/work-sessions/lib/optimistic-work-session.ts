import type { WorkSession } from "@/features/work-sessions/types/work-session";

const OPTIMISTIC_SESSION_PREFIX = "optimistic-session";

export function isOptimisticWorkSessionId(sessionId: string): boolean {
  return sessionId.startsWith(OPTIMISTIC_SESSION_PREFIX);
}

export function buildOptimisticWorkSession(input: {
  projectId: string;
  roomId: string | null;
  phaseId: string;
  status: "running" | "paused";
  existing?: WorkSession | null;
}): WorkSession {
  const timestamp = new Date().toISOString();

  return {
    id: input.existing?.id ?? `${OPTIMISTIC_SESSION_PREFIX}-${input.phaseId}`,
    project_id: input.projectId,
    room_id: input.roomId,
    phase_id: input.phaseId,
    started_at: input.existing?.started_at ?? timestamp,
    ended_at: null,
    duration_minutes: input.existing?.duration_minutes ?? null,
    status: input.status,
    note: input.existing?.note ?? null,
    next_step: input.existing?.next_step ?? null,
    blocker: input.existing?.blocker ?? null,
    created_at: input.existing?.created_at ?? timestamp,
    updated_at: timestamp,
    deleted_at: null,
  };
}

export function withWorkSessionStatus(
  session: WorkSession,
  status: WorkSession["status"]
): WorkSession {
  return {
    ...session,
    status,
    updated_at: new Date().toISOString(),
  };
}
