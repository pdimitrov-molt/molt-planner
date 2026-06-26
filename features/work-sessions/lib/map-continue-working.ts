import {
  extractWorkSessionContext,
  getSessionDurationMinutes,
} from "@/features/work-sessions/lib/build-work-session-log";
import { formatWorkDurationMinutes } from "@/features/work-sessions/lib/format-work-duration";
import type { ContinueWorkingSession } from "@/features/work-sessions/types/continue-working";
import type { WorkSessionWithContextRow } from "@/features/work-sessions/types/work-session-log";
import {
  isWorkSessionStatus,
  mapWorkSessionRow,
} from "@/features/work-sessions/types/work-session";
import { isPhaseKind, PHASE_KIND_LABELS } from "@/features/phases/types/phase";
import { bg } from "@/src/i18n/bg";

function getPhaseLabel(phaseKind: string): string {
  if (isPhaseKind(phaseKind)) {
    return PHASE_KIND_LABELS[phaseKind];
  }

  return phaseKind || bg.common.notStarted;
}

export function mapContinueWorkingSession(
  row: WorkSessionWithContextRow,
  referenceDate: Date = new Date()
): ContinueWorkingSession {
  if (!isWorkSessionStatus(row.status)) {
    throw new Error(`Invalid work session status: ${row.status}`);
  }

  if (row.status !== "running" && row.status !== "completed") {
    throw new Error(`Unsupported continue working status: ${row.status}`);
  }

  const session = mapWorkSessionRow(row);
  const context = extractWorkSessionContext(row);
  const durationMinutes = getSessionDurationMinutes(session, referenceDate);

  return {
    session_id: session.id,
    project_id: session.project_id,
    project_name: context.project_name,
    room_id: session.room_id,
    room_name: context.room_name,
    phase_id: session.phase_id,
    phase_label: getPhaseLabel(context.phase_kind),
    started_at: session.started_at,
    note: session.note,
    next_step: session.next_step,
    duration_minutes: durationMinutes,
    duration_label: formatWorkDurationMinutes(durationMinutes),
    status: row.status,
  };
}

export function resolveContinueWorkingFromRows(
  rows: WorkSessionWithContextRow[],
  referenceDate: Date = new Date()
): ContinueWorkingSession | null {
  const runningRow = rows.find((row) => row.status === "running");

  if (runningRow) {
    return mapContinueWorkingSession(runningRow, referenceDate);
  }

  const latestCompleted = rows
    .filter((row) => row.status === "completed")
    .sort((left, right) => {
      const leftTime = Date.parse(left.ended_at ?? left.started_at);
      const rightTime = Date.parse(right.ended_at ?? right.started_at);
      return rightTime - leftTime;
    })[0];

  if (!latestCompleted) {
    return null;
  }

  return mapContinueWorkingSession(latestCompleted, referenceDate);
}
