import type { WaitingCategory } from "@/features/projects/types/project-workspace";
import type { TaskStatus } from "@/features/tasks/types/task";

export interface TodayNextTask {
  id: string;
  title: string;
  project_id: string;
  project_name: string;
  client_display_name: string;
  room_name: string;
  phase_label: string;
  estimated_hours: number;
  status: TaskStatus;
  status_label: string;
}

export interface TodayWaitingItem {
  id: string;
  category: WaitingCategory;
  title: string;
  context: string;
  room_name: string;
  project_id: string;
  project_name: string;
}

export interface TodayCapacitySummary {
  planned_hours: number;
  daily_capacity_hours: number;
  available_hours: number;
  load_percent: number;
  is_over_capacity: boolean;
  studio_remaining_hours: number;
}

export interface TodayView {
  date_label: string;
  active_project_count: number;
  next_task: TodayNextTask | null;
  waiting_items: TodayWaitingItem[];
  capacity: TodayCapacitySummary;
}
