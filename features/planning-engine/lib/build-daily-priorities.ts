import type { ProjectWithClient } from "@/features/projects/types/project";
import type { ProjectWorkspace } from "@/features/projects/types/project-workspace";
import {
  buildDashboardPriorities,
  type PausedWorkflowSession,
} from "@/features/planning-engine/lib/build-dashboard-priorities";
import type {
  DailyPrioritiesView,
  DashboardPriorityTier,
  PlanningWorkCandidate,
} from "@/features/planning-engine/types/planning-engine";
import type { ContinueWorkingResult } from "@/features/work-sessions/types/continue-working";
import type { ProjectWorkflowEngineView } from "@/features/workflow-engine/types/workflow-engine";

interface BuildDailyPrioritiesInput {
  projects: ProjectWithClient[];
  workflows: Map<string, ProjectWorkflowEngineView>;
  workspaces: ProjectWorkspace[];
  continueWorking: ContinueWorkingResult;
  pausedSessions?: PausedWorkflowSession[];
  referenceDate?: Date;
  limit?: number;
}

const WORK_TIERS: Set<DashboardPriorityTier> = new Set([
  "current_project_stage",
  "project_stages_waiting",
  "room_tasks",
  "document_tasks",
]);

export function buildDailyPriorities(
  input: BuildDailyPrioritiesInput
): DailyPrioritiesView {
  const dashboard = buildDashboardPriorities({
    projects: input.projects,
    workflows: input.workflows,
    continueWorking: input.continueWorking,
    pausedSessions: input.pausedSessions ?? [],
    referenceDate: input.referenceDate,
    workTierLimit: input.limit ?? 5,
  });

  const items: PlanningWorkCandidate[] = [];

  for (const section of dashboard.sections) {
    if (!WORK_TIERS.has(section.tier)) {
      continue;
    }

    for (const item of section.items) {
      if ("priority_score" in item) {
        items.push(item);
      }
    }
  }

  return {
    items: items.slice(0, input.limit ?? 5),
    reference_date: dashboard.reference_date,
  };
}
