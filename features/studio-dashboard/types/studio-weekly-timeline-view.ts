export type StudioTimelineBlockState = "completed" | "current" | "future" | "waiting";

export type StudioTimelineMilestoneCategory =
  | "presentation"
  | "approval"
  | "delivery"
  | "installation";

export interface StudioTimelineDay {
  index: number;
  date_iso: string;
  label: string;
  is_today: boolean;
  is_weekend: boolean;
}

export interface StudioTimelineBlock {
  id: string;
  label: string;
  start_day_index: number;
  span_days: number;
  state: StudioTimelineBlockState;
  href: string;
}

export interface StudioTimelineProjectRow {
  project_id: string;
  project_name: string;
  href: string;
  deadline_day_index: number | null;
  blocks: StudioTimelineBlock[];
}

export interface StudioTimelineMilestone {
  id: string;
  category: StudioTimelineMilestoneCategory;
  project_id: string;
  project_name: string;
  stage_name: string;
  group_name: string;
  href: string;
}

export interface StudioTimelineCapacityForecast {
  this_week_hours: number;
  next_week_hours: number;
  following_week_hours: number;
}

export interface StudioWeeklyTimelineView {
  days: StudioTimelineDay[];
  project_rows: StudioTimelineProjectRow[];
  capacity_forecast: StudioTimelineCapacityForecast;
  milestones: StudioTimelineMilestone[];
}
