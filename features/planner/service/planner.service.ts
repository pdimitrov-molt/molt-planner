import type { SupabaseClient } from "@supabase/supabase-js";

import { isPhaseKind, isPhaseStatus } from "@/features/phases/types/phase";
import {
  CapacityCalculator,
  type PhaseWorkloadInput,
} from "@/features/planner/capacity-calculator";
import type { StudioCapacityPlan } from "@/features/planner/types/capacity-plan";
import { getCachedSupabaseServerClient } from "@/lib/server/request-cache";
import { bg } from "@/src/i18n/bg";
import { formatLongDate } from "@/src/i18n/format";

interface StudioPhaseRow {
  phase_kind: string;
  status: string;
  estimated_hours: number | null;
}

export class PlannerRepository {
  constructor(private readonly database: SupabaseClient) {}

  async findActiveStudioPhases(): Promise<PhaseWorkloadInput[]> {
    const { data: projects, error: projectsError } = await this.database
      .from("projects")
      .select("id")
      .eq("engagement_status", "active")
      .is("deleted_at", null);

    if (projectsError) {
      throw new Error(projectsError.message);
    }

    const projectIds = (projects ?? []).map((project) => project.id);

    if (projectIds.length === 0) {
      return [];
    }

    const { data: rooms, error: roomsError } = await this.database
      .from("rooms")
      .select("id")
      .in("project_id", projectIds)
      .is("deleted_at", null);

    if (roomsError) {
      throw new Error(roomsError.message);
    }

    const roomIds = (rooms ?? []).map((room) => room.id);

    if (roomIds.length === 0) {
      return [];
    }

    const { data: phases, error: phasesError } = await this.database
      .from("phases")
      .select("phase_kind, status, estimated_hours")
      .in("room_id", roomIds)
      .is("deleted_at", null);

    if (phasesError) {
      throw new Error(phasesError.message);
    }

    return (phases as StudioPhaseRow[]).map((phase) => {
      if (!isPhaseKind(phase.phase_kind)) {
        throw new Error(`Invalid phase kind: ${phase.phase_kind}`);
      }

      if (!isPhaseStatus(phase.status)) {
        throw new Error(`Invalid phase status: ${phase.status}`);
      }

      return {
        phase_kind: phase.phase_kind,
        status: phase.status,
        estimated_hours: phase.estimated_hours,
      };
    });
  }

  async countActiveProjects(): Promise<number> {
    const { count, error } = await this.database
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("engagement_status", "active")
      .is("deleted_at", null);

    if (error) {
      throw new Error(error.message);
    }

    return count ?? 0;
  }
}

export class PlannerService {
  constructor(
    private readonly repository: PlannerRepository,
    private readonly calculator: CapacityCalculator = new CapacityCalculator()
  ) {}

  async getStudioCapacityPlan(): Promise<StudioCapacityPlan> {
    const [phases, activeProjectCount] = await Promise.all([
      this.repository.findActiveStudioPhases(),
      this.repository.countActiveProjects(),
    ]);

    const calculation = this.calculator.calculate({ phases });

    return {
      ...calculation,
      active_project_count: activeProjectCount,
      remaining_hours_label: bg.capacity.remainingHoursLabel(
        calculation.remaining_hours
      ),
      weekly_capacity_label: bg.capacity.weeklyCapacityLabel(
        calculation.weekly_capacity_hours
      ),
      estimated_completion_label: formatCompletionLabel(
        calculation.estimated_completion_date,
        calculation.remaining_hours
      ),
      earliest_next_project_start_label: formatNextProjectLabel(
        calculation.earliest_next_project_start,
        calculation.remaining_hours
      ),
    };
  }
}

function formatCompletionLabel(dateValue: string, remainingHours: number) {
  if (remainingHours <= 0) {
    return bg.capacity.workloadComplete;
  }

  return formatLongDate(dateValue);
}

function formatNextProjectLabel(dateValue: string, remainingHours: number) {
  if (remainingHours <= 0) {
    return bg.capacity.availableImmediately;
  }

  return formatLongDate(dateValue);
}

export async function getPlannerService(): Promise<PlannerService> {
  const database = await getCachedSupabaseServerClient();
  return new PlannerService(new PlannerRepository(database));
}
