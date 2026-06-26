import { ZodError } from "zod";

import { WorkSessionRepository } from "@/features/work-sessions/repository/work-session.repository";
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
} from "@/features/work-sessions/types/work-session-log";
import type { WorkSession } from "@/features/work-sessions/types/work-session";
import {
  completeWorkSessionSchema,
  findWorkSessionsByPhaseSchema,
  normalizeCompleteWorkSessionInput,
  pauseWorkSessionSchema,
  resumeWorkSessionSchema,
  startWorkSessionSchema,
  type CompleteWorkSessionInput,
  type FindWorkSessionsByPhaseInput,
  type PauseWorkSessionInput,
  type ResumeWorkSessionInput,
  type StartWorkSessionInput,
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
      room_id: validatedInput.room_id,
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

  static isValidationError(error: unknown): error is ZodError {
    return error instanceof ZodError;
  }

  static getValidationMessage(error: ZodError): string {
    return error.issues[0]?.message ?? bg.validation.failed;
  }
}
