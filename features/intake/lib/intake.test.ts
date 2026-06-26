import assert from "node:assert/strict";

import { assessScheduleFit } from "./assess-schedule-fit";
import { buildSimulatedPhasesForRoomCount, getEstimatedHoursPerRoom } from "./build-simulated-phases";
import { calculateIntakePlan } from "./calculate-intake-plan";
import { CapacityCalculator } from "@/features/planner/capacity-calculator";

const studioContext = {
  remaining_hours: 90,
  weekly_capacity_hours: 45,
  earliest_next_project_start: "2026-07-02",
  earliest_next_project_start_label: "July 2, 2026",
  active_project_count: 2,
};

assert.equal(getEstimatedHoursPerRoom(), 84);

const oneRoomPhases = buildSimulatedPhasesForRoomCount(1);
assert.equal(oneRoomPhases.length, 7);
assert.equal(
  new CapacityCalculator(45).calculateRemainingHours(oneRoomPhases),
  84
);

const intakePlan = calculateIntakePlan(
  {
    category: "residential",
    scope: {
      mode: "manual",
      site_area: 180,
      approximate_room_count: 2,
      selected_template_room_keys: [],
    },
  },
  studioContext,
  new Date("2026-06-25T12:00:00.000Z")
);

assert.equal(intakePlan.estimate.room_count, 2);
assert.equal(intakePlan.estimate.estimated_hours, 168);
assert.equal(intakePlan.estimate.estimated_duration_weeks, 4);
assert.equal(intakePlan.estimate.earliest_available_start, "2026-07-02");

const greenFit = assessScheduleFit({
  currentRemainingHours: 0,
  newProjectHours: 84,
  weeklyCapacityHours: 45,
});
assert.equal(greenFit.status, "green");

const yellowFit = assessScheduleFit({
  currentRemainingHours: 45,
  newProjectHours: 45,
  weeklyCapacityHours: 45,
});
assert.equal(yellowFit.status, "yellow");
assert.equal(yellowFit.parallel_delay_weeks, 1);

const redFit = assessScheduleFit({
  currentRemainingHours: 360,
  newProjectHours: 420,
  weeklyCapacityHours: 45,
});
assert.equal(redFit.status, "red");

console.log("intake planner tests passed");
