import type {
  LogManualWorkSessionInput,
  UpdateManualWorkSessionInput,
} from "@/features/work-sessions/validation/work-session.schema";

function optionalText(value: string | undefined) {
  if (!value || value.trim().length === 0) {
    return null;
  }

  return value.trim();
}

type ManualSessionTimingInput =
  | Pick<Extract<LogManualWorkSessionInput, { mode: "range" }>, "mode" | "date" | "start_time" | "end_time">
  | Pick<Extract<LogManualWorkSessionInput, { mode: "duration" }>, "mode" | "date" | "duration_minutes">
  | Pick<Extract<UpdateManualWorkSessionInput, { mode: "range" }>, "mode" | "date" | "start_time" | "end_time">
  | Pick<Extract<UpdateManualWorkSessionInput, { mode: "duration" }>, "mode" | "date" | "duration_minutes">;

export function resolveManualSessionTimestamps(
  input: ManualSessionTimingInput
): {
  started_at: string;
  ended_at: string;
  duration_minutes: number;
} {
  if (input.mode === "range") {
    const started_at = new Date(`${input.date}T${input.start_time}:00`).toISOString();
    const ended_at = new Date(`${input.date}T${input.end_time}:00`).toISOString();
    const duration_minutes = Math.max(
      1,
      Math.round((Date.parse(ended_at) - Date.parse(started_at)) / 60_000)
    );

    return { started_at, ended_at, duration_minutes };
  }

  const ended_at = new Date(`${input.date}T18:00:00`).toISOString();
  const started_at = new Date(
    Date.parse(ended_at) - input.duration_minutes * 60_000
  ).toISOString();

  return {
    started_at,
    ended_at,
    duration_minutes: input.duration_minutes,
  };
}

export function normalizeManualSessionNote(note: string | undefined): string | null {
  return optionalText(note);
}

export function hoursToMinutes(hours: number): number {
  return Math.max(0, Math.round(hours * 60));
}
