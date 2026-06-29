export type DailyScheduleItemKind =
  | "project"
  | "personal"
  | "meeting"
  | "reminder"
  | "waiting";

export interface DailyScheduleItem {
  id: string;
  kind: DailyScheduleItemKind;
  title: string;
  subtitle: string;
  time_label: string | null;
  sort_minutes: number | null;
  href: string;
  project_id: string | null;
}

export interface DailyScheduleSummary {
  project_tasks: number;
  personal_tasks: number;
  meetings: number;
  waiting: number;
}

export interface DailyScheduleView {
  date_label: string;
  user_name: string;
  summary: DailyScheduleSummary;
  timed_items: DailyScheduleItem[];
  untimed_items: DailyScheduleItem[];
}
