import type { SupabaseClient } from "@supabase/supabase-js";

import {
  mapWorkSessionRow,
  type WorkSession,
  type WorkSessionRow,
} from "@/features/work-sessions/types/work-session";
import type { WorkSessionWithContextRow } from "@/features/work-sessions/types/work-session-log";
import type {
  CompleteWorkSessionPayload,
  CreateCompletedWorkSessionPayload,
  StartWorkSessionPayload,
  UpdateCompletedWorkSessionPayload,
} from "@/features/work-sessions/validation/work-session.schema";

const WORK_SESSION_CONTEXT_SELECT = `
  *,
  projects:project_id (name),
  rooms:room_id (name),
  phases:phase_id (phase_kind)
`;

export class WorkSessionRepository {
  constructor(private readonly database: SupabaseClient) {}

  async startSession(payload: StartWorkSessionPayload): Promise<WorkSession> {
    const timestamp = new Date().toISOString();
    const insertPayload = {
      ...payload,
      created_at: timestamp,
      updated_at: timestamp,
      deleted_at: null,
    };

    const { data, error } = await this.database
      .from("work_sessions")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapWorkSessionRow(data as WorkSessionRow);
  }

  async pauseSession(sessionId: string): Promise<WorkSession> {
    const { data, error } = await this.database
      .from("work_sessions")
      .update({ status: "paused" })
      .eq("id", sessionId)
      .eq("status", "running")
      .is("deleted_at", null)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Work session was not found or is not running.");
    }

    return mapWorkSessionRow(data as WorkSessionRow);
  }

  async resumeSession(sessionId: string): Promise<WorkSession> {
    const { data, error } = await this.database
      .from("work_sessions")
      .update({ status: "running" })
      .eq("id", sessionId)
      .eq("status", "paused")
      .is("deleted_at", null)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Work session was not found or is not paused.");
    }

    return mapWorkSessionRow(data as WorkSessionRow);
  }

  async completeSession(
    sessionId: string,
    payload: CompleteWorkSessionPayload
  ): Promise<WorkSession> {
    const { data, error } = await this.database
      .from("work_sessions")
      .update(payload)
      .eq("id", sessionId)
      .in("status", ["running", "paused"])
      .is("deleted_at", null)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Work session was not found or is already completed.");
    }

    return mapWorkSessionRow(data as WorkSessionRow);
  }

  async createCompletedSession(
    payload: CreateCompletedWorkSessionPayload
  ): Promise<WorkSession> {
    const timestamp = new Date().toISOString();
    const insertPayload = {
      ...payload,
      created_at: timestamp,
      updated_at: timestamp,
      deleted_at: null,
    };

    const { data, error } = await this.database
      .from("work_sessions")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapWorkSessionRow(data as WorkSessionRow);
  }

  async updateCompletedSession(
    sessionId: string,
    payload: UpdateCompletedWorkSessionPayload
  ): Promise<WorkSession> {
    const { data, error } = await this.database
      .from("work_sessions")
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .eq("status", "completed")
      .is("deleted_at", null)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Work session was not found or is not completed.");
    }

    return mapWorkSessionRow(data as WorkSessionRow);
  }

  async softDeleteSession(sessionId: string): Promise<WorkSession> {
    const timestamp = new Date().toISOString();
    const { data, error } = await this.database
      .from("work_sessions")
      .update({
        deleted_at: timestamp,
        updated_at: timestamp,
      })
      .eq("id", sessionId)
      .is("deleted_at", null)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Work session was not found.");
    }

    return mapWorkSessionRow(data as WorkSessionRow);
  }

  async findRunningSession(): Promise<WorkSession | null> {
    const { data, error } = await this.database
      .from("work_sessions")
      .select("*")
      .eq("status", "running")
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return mapWorkSessionRow(data as WorkSessionRow);
  }

  async findByPhase(phaseId: string): Promise<WorkSession[]> {
    const { data, error } = await this.database
      .from("work_sessions")
      .select("*")
      .eq("phase_id", phaseId)
      .is("deleted_at", null)
      .order("started_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data as WorkSessionRow[]).map(mapWorkSessionRow);
  }

  async findById(sessionId: string): Promise<WorkSession | null> {
    const { data, error } = await this.database
      .from("work_sessions")
      .select("*")
      .eq("id", sessionId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return mapWorkSessionRow(data as WorkSessionRow);
  }

  async findTodaySessionsWithContext(
    dayStartIso: string,
    dayEndIso: string
  ): Promise<WorkSessionWithContextRow[]> {
    const { data, error } = await this.database
      .from("work_sessions")
      .select(WORK_SESSION_CONTEXT_SELECT)
      .is("deleted_at", null)
      .or(
        [
          "status.eq.running",
          `and(status.eq.completed,started_at.gte.${dayStartIso},started_at.lte.${dayEndIso})`,
          `and(status.eq.completed,ended_at.gte.${dayStartIso},ended_at.lte.${dayEndIso})`,
        ].join(",")
      )
      .order("started_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as WorkSessionWithContextRow[];
  }

  async findCompletedSessionsByPhaseWithContext(
    phaseId: string
  ): Promise<WorkSessionWithContextRow[]> {
    const { data, error } = await this.database
      .from("work_sessions")
      .select(WORK_SESSION_CONTEXT_SELECT)
      .eq("phase_id", phaseId)
      .eq("status", "completed")
      .is("deleted_at", null)
      .order("started_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as WorkSessionWithContextRow[];
  }

  async findContinueWorkingWithContext(): Promise<WorkSessionWithContextRow[]> {
    const { data, error } = await this.database
      .from("work_sessions")
      .select(WORK_SESSION_CONTEXT_SELECT)
      .is("deleted_at", null)
      .in("status", ["running", "completed"])
      .order("updated_at", { ascending: false })
      .limit(100);

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as WorkSessionWithContextRow[];
  }

  async findRecentSessionsWithContext(limit: number): Promise<WorkSessionWithContextRow[]> {
    const { data, error } = await this.database
      .from("work_sessions")
      .select(WORK_SESSION_CONTEXT_SELECT)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as WorkSessionWithContextRow[];
  }
}
