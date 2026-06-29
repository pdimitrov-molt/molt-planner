import { ZodError } from "zod";

import { WorkSessionRepository } from "@/features/work-sessions/repository/work-session.repository";
import {
  sumCompletedSessionMinutes,
  calculatePhaseWorkStats,
} from "@/features/work-sessions/lib/calculate-phase-work-stats";
import {
  hoursToMinutes,
  normalizeManualSessionNote,
  resolveManualSessionTimestamps,
} from "@/features/work-sessions/lib/resolve-manual-session-times";
import {
  buildTodayWorkSummary,
  mapPhaseWorkSessionHistoryEntry,
  mapTodayWorkSessionEntry,
  sortTodayWorkSessionEntries,
} from "@/features/work-sessions/lib/build-work-session-log";
import { getDayBounds } from "@/features/work-sessions/lib/get-day-bounds";
import { resolveContinueWorkingFromRows } from "@/features/work-sessions/lib/map-continue-working";
import type { ContinueWorkingResult } from "@/features/work-sessions/types/continue-working";
import type {
  PhaseWorkSessionHistoryEntry,
  TodayWorkSessionEntry,
  TodayWorkSummary,
  WorkSessionWithContextRow,
} from "@/features/work-sessions/types/work-session-log";
import type { WorkSession } from "@/features/work-sessions/types/work-session";
import {
  completeWorkSessionSchema,
  deleteWorkSessionSchema,
  findWorkSessionsByPhaseSchema,
  logManualWorkSessionSchema,
  normalizeCompleteWorkSessionInput,
  pauseWorkSessionSchema,
  resumeWorkSessionSchema,
  startWorkSessionSchema,
  updateManualWorkSessionSchema,
  type CompleteWorkSessionInput,
  type DeleteWorkSessionInput,
  type FindWorkSessionsByPhaseInput,
  type LogManualWorkSessionInput,
  type PauseWorkSessionInput,
  type ResumeWorkSessionInput,
  type StartWorkSessionInput,
  type UpdateManualWorkSessionInput,
} from "@/features/work-sessions/validation/work-session.schema";
import { bg } from "@/src/i18n/bg";

const RUNNING_SESSION_CONFLICT_MESSAGE =
  "Another work session is already running.";

export class WorkSessionService {
  constructor(private readonly repository: WorkSessionRepository) {}

  async startSession(input: StartWorkSessionInput): Promise<WorkSession> {
    const validatedInput = startWorkSessionSchema.parse(input);
    const runningSession = await this.repository.findRunningSession();

    if (runningSession) {
      throw new Error(RUNNING_SESSION_CONFLICT_MESSAGE);
    }

    const timestamp = new Date().toISOString();

    return this.repository.startSession({
      project_id: validatedInput.project_id,
      room_id: validatedInput.room_id ?? null,
      phase_id: validatedInput.phase_id,
      started_at: timestamp,
      status: "running",
      ended_at: null,
      duration_minutes: null,
      note: null,
      next_step: null,
      blocker: null,
    });
  }

  async pauseSession(input: PauseWorkSessionInput): Promise<WorkSession> {
    const validatedInput = pauseWorkSessionSchema.parse(input);
    return this.repository.pauseSession(validatedInput.id);
  }

  async resumeSession(input: ResumeWorkSessionInput): Promise<WorkSession> {
    const validatedInput = resumeWorkSessionSchema.parse(input);
    const runningSession = await this.repository.findRunningSession();

    if (runningSession && runningSession.id !== validatedInput.id) {
      throw new Error(RUNNING_SESSION_CONFLICT_MESSAGE);
    }

    return this.repository.resumeSession(validatedInput.id);
  }

  async completeSession(input: CompleteWorkSessionInput): Promise<WorkSession> {
    const validatedInput = completeWorkSessionSchema.parse(input);
    const normalizedInput = normalizeCompleteWorkSessionInput(validatedInput);
    const session = await this.repository.findById(normalizedInput.id);

    if (!session) {
      throw new Error("Work session was not found.");
    }

    if (session.status !== "running" && session.status !== "paused") {
      throw new Error("Work session is not active.");
    }

    const endedAt = new Date().toISOString();
    const durationMinutes = Math.max(
      0,
      Math.round(
        (Date.parse(endedAt) - Date.parse(session.started_at)) / 60_000
      )
    );

    return this.repository.completeSession(normalizedInput.id, {
      ended_at: endedAt,
      duration_minutes: durationMinutes,
      status: "completed",
      note: normalizedInput.note,
      next_step: normalizedInput.next_step,
      blocker: normalizedInput.blocker,
    });
  }

  async findRunningSession(): Promise<WorkSession | null> {
    return this.repository.findRunningSession();
  }

  async findByPhase(input: FindWorkSessionsByPhaseInput): Promise<WorkSession[]> {
    const validatedInput = findWorkSessionsByPhaseSchema.parse(input);
    return this.repository.findByPhase(validatedInput.phase_id);
  }

  async getTodaySessions(
    referenceDate: Date = new Date()
  ): Promise<TodayWorkSessionEntry[]> {
    const { dayStartIso, dayEndIso } = getDayBounds(referenceDate);
    const rows = await this.repository.findTodaySessionsWithContext(
      dayStartIso,
      dayEndIso
    );

    return sortTodayWorkSessionEntries(
      rows.map((row) => mapTodayWorkSessionEntry(row, referenceDate))
    );
  }

  async getTodaySummary(
    referenceDate: Date = new Date()
  ): Promise<TodayWorkSummary> {
    const entries = await this.getTodaySessions(referenceDate);
    return buildTodayWorkSummary(entries);
  }

  async getPhaseHistory(phaseId: string): Promise<PhaseWorkSessionHistoryEntry[]> {
    const validatedInput = findWorkSessionsByPhaseSchema.parse({ phase_id: phaseId });
    const rows = await this.repository.findCompletedSessionsByPhaseWithContext(
      validatedInput.phase_id
    );

    return rows.map(mapPhaseWorkSessionHistoryEntry);
  }

  async getContinueWorking(
    referenceDate: Date = new Date()
  ): Promise<ContinueWorkingResult> {
    const rows = await this.repository.findContinueWorkingWithContext();
    const session = resolveContinueWorkingFromRows(rows, referenceDate);

    if (!session) {
      return { kind: "empty" };
    }

    if (session.status === "running") {
      return { kind: "running", session };
    }

    return { kind: "completed", session };
  }

  async getRecentSessions(limit = 8): Promise<WorkSessionWithContextRow[]> {
    return this.repository.findRecentSessionsWithContext(limit);
  }

  async logManualSession(input: LogManualWorkSessionInput): Promise<WorkSession> {
    const validatedInput = logManualWorkSessionSchema.parse(input);
    const timestamps = resolveManualSessionTimestamps(validatedInput);

    return this.repository.createCompletedSession({
      project_id: validatedInput.project_id,
      room_id: validatedInput.room_id ?? null,
      phase_id: validatedInput.phase_id,
      started_at: timestamps.started_at,
      ended_at: timestamps.ended_at,
      duration_minutes: timestamps.duration_minutes,
      status: "completed",
      note: normalizeManualSessionNote(validatedInput.note),
      next_step: null,
      blocker: null,
    });
  }

  async updateManualSession(input: UpdateManualWorkSessionInput): Promise<WorkSession> {
    const validatedInput = updateManualWorkSessionSchema.parse(input);
    const existing = await this.repository.findById(validatedInput.id);

    if (!existing) {
      throw new Error("Work session was not found.");
    }

    if (existing.status !== "completed") {
      throw new Error("Only completed work sessions can be edited.");
    }

    const timestamps = resolveManualSessionTimestamps(validatedInput);

    return this.repository.updateCompletedSession(validatedInput.id, {
      started_at: timestamps.started_at,
      ended_at: timestamps.ended_at,
      duration_minutes: timestamps.duration_minutes,
      note: normalizeManualSessionNote(validatedInput.note),
    });
  }

  async deleteSession(input: DeleteWorkSessionInput): Promise<WorkSession> {
    const validatedInput = deleteWorkSessionSchema.parse(input);
    const existing = await this.repository.findById(validatedInput.id);

    if (!existing) {
      throw new Error("Work session was not found.");
    }

    if (existing.status === "running" || existing.status === "paused") {
      throw new Error("Active work sessions must be finished before deletion.");
    }

    return this.repository.softDeleteSession(validatedInput.id);
  }

  async forceCompletePhaseSession(input: {
    phase_id: string;
    note?: string | null;
  }): Promise<WorkSession | null> {
    const sessions = await this.repository.findByPhase(input.phase_id);
    const activeSession = sessions.find(
      (session) => session.status === "running" || session.status === "paused"
    );

    if (!activeSession) {
      return null;
    }

    const endedAt = new Date().toISOString();
    const durationMinutes = Math.max(
      1,
      Math.round(
        (Date.parse(endedAt) - Date.parse(activeSession.started_at)) / 60_000
      )
    );

    return this.repository.completeSession(activeSession.id, {
      ended_at: endedAt,
      duration_minutes: durationMinutes,
      status: "completed",
      note: input.note ?? activeSession.note,
      next_step: activeSession.next_step,
      blocker: activeSession.blocker,
    });
  }

  async createManualSessionForRemainingHours(input: {
    project_id: string;
    room_id: string | null;
    phase_id: string;
    target_minutes: number;
    note?: string | null;
  }): Promise<WorkSession | null> {
    if (input.target_minutes <= 0) {
      return null;
    }

    const endedAt = new Date();
    const startedAt = new Date(endedAt.getTime() - input.target_minutes * 60_000);

    return this.repository.createCompletedSession({
      project_id: input.project_id,
      room_id: input.room_id,
      phase_id: input.phase_id,
      started_at: startedAt.toISOString(),
      ended_at: endedAt.toISOString(),
      duration_minutes: input.target_minutes,
      status: "completed",
      note: input.note ?? null,
      next_step: null,
      blocker: null,
    });
  }

  async getPhaseWorkStats(input: {
    phase_id: string;
    estimated_hours: number;
    referenceDate?: Date;
  }) {
    const sessions = await this.repository.findByPhase(input.phase_id);
    return calculatePhaseWorkStats({
      estimated_hours: input.estimated_hours,
      sessions,
      referenceDate: input.referenceDate,
    });
  }

  async resolveStageCompletionMinutes(input: {
    phase_id: string;
    actual_hours: number;
  }): Promise<number> {
    const sessions = await this.repository.findByPhase(input.phase_id);
    const loggedMinutes = sumCompletedSessionMinutes(sessions);
    const targetMinutes = hoursToMinutes(input.actual_hours);
    return Math.max(0, targetMinutes - loggedMinutes);
  }

  static isValidationError(error: unknown): error is ZodError {
    return error instanceof ZodError;
  }

  static getValidationMessage(error: ZodError): string {
    return error.issues[0]?.message ?? bg.validation.failed;
  }
}
