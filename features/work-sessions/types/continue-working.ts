export interface ContinueWorkingSession {
  session_id: string;
  project_id: string;
  project_name: string;
  room_id: string;
  room_name: string;
  phase_id: string;
  phase_label: string;
  started_at: string;
  note: string | null;
  next_step: string | null;
  duration_minutes: number;
  duration_label: string;
  status: "running" | "completed";
}

export type ContinueWorkingResult =
  | { kind: "empty" }
  | { kind: "running"; session: ContinueWorkingSession }
  | { kind: "completed"; session: ContinueWorkingSession };
