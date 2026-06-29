import { getSessionDurationMinutes } from "@/features/work-sessions/lib/build-work-session-log";
import type { WorkSession } from "@/features/work-sessions/types/work-session";

export interface PhaseWorkStats {
  estimated_hours: number;
  worked_hours: number;
  remaining_hours: number;
  variance_hours: number;
  worked_minutes: number;
}

function roundHours(value: number): number {
  return Math.round(value * 10) / 10;
}

export function calculatePhaseWorkStats(input: {
  estimated_hours: number;
  sessions: WorkSession[];
  referenceDate?: Date;
}): PhaseWorkStats {
  const referenceDate = input.referenceDate ?? new Date();
  const worked_minutes = input.sessions
    .filter((session) => session.status === "completed")
    .reduce(
      (total, session) => total + getSessionDurationMinutes(session, referenceDate),
      0
    );

  const worked_hours = roundHours(worked_minutes / 60);
  const remaining_hours = roundHours(Math.max(0, input.estimated_hours - worked_hours));
  const variance_hours = roundHours(worked_hours - input.estimated_hours);

  return {
    estimated_hours: input.estimated_hours,
    worked_hours,
    remaining_hours,
    variance_hours,
    worked_minutes,
  };
}

export function sumCompletedSessionMinutes(sessions: WorkSession[]): number {
  return sessions
    .filter((session) => session.status === "completed")
    .reduce((total, session) => total + getSessionDurationMinutes(session), 0);
}
