import type { CapacityCalculationResult } from "@/features/planner/capacity-calculator";

export interface StudioCapacityPlan extends CapacityCalculationResult {
  active_project_count: number;
  remaining_hours_label: string;
  weekly_capacity_label: string;
  estimated_completion_label: string;
  earliest_next_project_start_label: string;
}

export interface ProjectCapacitySummary {
  project_id: string;
  project_name: string;
  remaining_hours: number;
}
