import { calculateIntakePlan } from "@/features/intake/lib/calculate-intake-plan";
import type {
  IntakeSimulationInput,
  IntakeSimulationResult,
  IntakeStudioContext,
} from "@/features/intake/types/intake-plan";
import { intakeSimulationSchema } from "@/features/intake/validation/intake.schema";
import { getPlannerService } from "@/features/planner/service/planner.service";

export class IntakeService {
  async getStudioContext(): Promise<IntakeStudioContext> {
    const plannerService = await getPlannerService();
    const plan = await plannerService.getStudioCapacityPlan();

    return {
      remaining_hours: plan.remaining_hours,
      weekly_capacity_hours: plan.weekly_capacity_hours,
      earliest_next_project_start: plan.earliest_next_project_start,
      earliest_next_project_start_label: plan.earliest_next_project_start_label,
      active_project_count: plan.active_project_count,
    };
  }

  simulateIntakeWithStudioContext(
    input: IntakeSimulationInput,
    studio: IntakeStudioContext
  ): IntakeSimulationResult {
    const validated = intakeSimulationSchema.parse(input);
    return calculateIntakePlan(validated, studio);
  }
}

export async function getIntakeService(): Promise<IntakeService> {
  return new IntakeService();
}
