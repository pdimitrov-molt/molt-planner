import assert from "node:assert/strict";

import {
  CapacityCalculator,
  type PhaseWorkloadInput,
} from "./capacity-calculator";
import { calculateAvailableHours, calculateLoad } from "./capacity";

const calculator = new CapacityCalculator(45);

const samplePhases: PhaseWorkloadInput[] = [
  { phase_kind: "discovery", status: "completed", estimated_hours: 8 },
  { phase_kind: "concept", status: "in_progress", estimated_hours: 16 },
  { phase_kind: "design_development", status: "not_started", estimated_hours: 24 },
];

const result = calculator.calculate({
  phases: samplePhases,
  reference_date: new Date("2026-06-25T12:00:00.000Z"),
});

assert.equal(result.remaining_hours, 40);
assert.equal(result.completed_hours, 8);
assert.equal(result.weekly_capacity_hours, 45);
assert.equal(result.working_days_to_complete, 5);
assert.equal(result.estimated_completion_date, "2026-07-02");
assert.equal(result.earliest_next_project_start, "2026-07-02");

assert.equal(calculateAvailableHours(20), 25);
assert.equal(calculateLoad(20), 44);

console.log("capacity tests passed");
