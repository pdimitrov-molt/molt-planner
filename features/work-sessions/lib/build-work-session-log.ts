import { format, parseISO } from "date-fns";

import { formatWorkDurationMinutes } from "@/features/work-sessions/lib/format-work-duration";
import type {
  PhaseWorkSessionHistoryEntry,
  TodayWorkSessionEntry,
  TodayWorkSummary,
  WorkSessionContextSnapshot,
  WorkSessionWithContextRow,
} from "@/features/work-sessions/types/work-session-log";
import {
  isWorkSessionStatus,
  mapWorkSessionRow,
  type WorkSession,
} from "@/features/work-sessions/types/work-session";
import { isPhaseKind, PHASE_KIND_LABELS } from "@/features/phases/types/phase";
import { bg } from "@/src/i18n/bg";
import { bgLocale } from "@/src/i18n/format";

function resolveJoinedName(
  value: { name: string } | { name: string }[] | null | undefined,
  fallback: string
): string {
  if (Array.isArray(value)) {
    return value[0]?.name ?? fallback;
  }

  return value?.name ?? fallback;
}

function resolvePhaseKind(
  value: { phase_kind: string } | { phase_kind: string }[] | null | undefined
): string {
  if (Array.isArray(value)) {
    return value[0]?.phase_kind ?? "";
  }

  return value?.phase_kind ?? "";
}

export function extractWorkSessionContext(
  row: WorkSessionWithContextRow
): WorkSessionContextSnapshot {
  return {
    project_name: resolveJoinedName(row.projects, bg.common.projectFallback),
    room_name: row.room_id
      ? resolveJoinedName(row.rooms, bg.common.roomFallback)
      : null,
    phase_kind: resolvePhaseKind(row.phases),
  };
}

function getPhaseLabel(phaseKind: string): string {
  if (isPhaseKind(phaseKind)) {
    return PHASE_KIND_LABELS[phaseKind];
  }

  return phaseKind || bg.common.notStarted;
}

function formatClockTime(value: string): string {
  return format(parseISO(value), "HH:mm", { locale: bgLocale });
}

export function formatSessionTimeRange(
  session: Pick<WorkSession, "started_at" | "ended_at" | "status">,
  referenceDate: Date = new Date()
): string {
  const startLabel = formatClockTime(session.started_at);

  if (session.status === "running") {
    return `${startLabel}–${format(referenceDate, "HH:mm", { locale: bgLocale })}`;
  }

  if (session.ended_at) {
    return `${startLabel}–${formatClockTime(session.ended_at)}`;
  }

  return startLabel;
}

export function getSessionDurationMinutes(
  session: Pick<
    WorkSession,
    "started_at" | "ended_at" | "duration_minutes" | "status"
  >,
  referenceDate: Date = new Date()
): number {
  if (session.status === "completed" && session.duration_minutes !== null) {
    return session.duration_minutes;
  }

  if (session.status === "running") {
    return Math.max(
      0,
      Math.round(
        (referenceDate.getTime() - Date.parse(session.started_at)) / 60_000
      )
    );
  }

  if (session.ended_at) {
    return Math.max(
      0,
      Math.round(
        (Date.parse(session.ended_at) - Date.parse(session.started_at)) / 60_000
      )
    );
  }

  return session.duration_minutes ?? 0;
}

export function mapTodayWorkSessionEntry(
  row: WorkSessionWithContextRow,
  referenceDate: Date = new Date()
): TodayWorkSessionEntry {
  if (!isWorkSessionStatus(row.status)) {
    throw new Error(`Invalid work session status: ${row.status}`);
  }

  const session = mapWorkSessionRow(row);
  const context = extractWorkSessionContext(row);
  const durationMinutes = getSessionDurationMinutes(session, referenceDate);

  return {
    id: session.id,
    project_id: session.project_id,
    project_name: context.project_name,
    room_id: session.room_id,
    room_name: context.room_name,
    phase_id: session.phase_id,
    phase_label: getPhaseLabel(context.phase_kind),
    started_at: session.started_at,
    ended_at: session.ended_at,
    duration_minutes: durationMinutes,
    status: session.status,
    time_range_label: formatSessionTimeRange(session, referenceDate),
    worked_duration_label: formatWorkDurationMinutes(durationMinutes),
  };
}

export function sortTodayWorkSessionEntries(
  entries: TodayWorkSessionEntry[]
): TodayWorkSessionEntry[] {
  return [...entries].sort((left, right) => {
    if (left.status === "running" && right.status !== "running") {
      return -1;
    }

    if (right.status === "running" && left.status !== "running") {
      return 1;
    }

    return Date.parse(right.started_at) - Date.parse(left.started_at);
  });
}

export function buildTodayWorkSummary(
  entries: TodayWorkSessionEntry[]
): TodayWorkSummary {
  const completedCount = entries.filter(
    (entry) => entry.status === "completed"
  ).length;
  const runningCount = entries.filter((entry) => entry.status === "running").length;
  const totalMinutes = entries.reduce(
    (total, entry) => total + entry.duration_minutes,
    0
  );

  return {
    total_minutes: totalMinutes,
    total_label: formatWorkDurationMinutes(totalMinutes),
    completed_count: completedCount,
    running_count: runningCount,
    completed_label: bg.workSessionLog.completedCount(completedCount),
    running_label: bg.workSessionLog.runningCount(runningCount),
  };
}

export function mapPhaseWorkSessionHistoryEntry(
  row: WorkSessionWithContextRow
): PhaseWorkSessionHistoryEntry {
  const session = mapWorkSessionRow(row);
  const durationMinutes = getSessionDurationMinutes(session);
  const dateSource = session.started_at;

  return {
    id: session.id,
    date_label: format(parseISO(dateSource), "d MMM", {
      locale: bgLocale,
    }),
    time_range_label: formatSessionTimeRange(session),
    worked_duration_label: formatWorkDurationMinutes(durationMinutes),
    note: session.note,
    next_step: session.next_step,
    blocker: session.blocker,
    started_at: session.started_at,
    ended_at: session.ended_at,
    duration_minutes: durationMinutes,
  };
}
