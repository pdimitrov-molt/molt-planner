import type { PhaseStatus } from "@/features/phases/types/phase";
import type { ProjectWithClient } from "@/features/projects/types/project";
import { calculatePriorityScore } from "@/features/planning-engine/lib/calculate-priority-score";
import { calculateStageMetrics } from "@/features/planning-engine/lib/calculate-stage-metrics";
import type {
  DashboardBlockedItem,
  DashboardDeadlineItem,
  DashboardPausedItem,
  DashboardPrioritiesView,
  DashboardPriorityItem,
  DashboardPrioritySection,
  DashboardPriorityTier,
  PlanningWorkCandidate,
} from "@/features/planning-engine/types/planning-engine";
import { DASHBOARD_PRIORITY_TIER_ORDER } from "@/features/planning-engine/types/planning-engine";
import type { ContinueWorkingResult } from "@/features/work-sessions/types/continue-working";
import type { WorkflowWaitingEvent } from "@/features/workflow-engine/types/workflow-waiting-event";
import type {
  ProjectWorkflowEngineView,
  WorkflowStageInstanceView,
  WorkflowStageView,
} from "@/features/workflow-engine/types/workflow-engine";
import { bg } from "@/src/i18n/bg";
import { formatLongDate } from "@/src/i18n/format";

interface BuildDashboardPrioritiesInput {
  projects: ProjectWithClient[];
  workflows: Map<string, ProjectWorkflowEngineView>;
  continueWorking: ContinueWorkingResult;
  pausedSessions: PausedWorkflowSession[];
  activeWaitingByInstanceId?: Map<string, WorkflowWaitingEvent>;
  referenceDate?: Date;
  workTierLimit?: number;
  waitingTierLimit?: number;
}

export interface PausedWorkflowSession {
  session_id: string;
  project_id: string;
  project_name: string;
  group_name: string;
  stage_name: string;
  instance_name: string | null;
  phase_id: string;
}

interface StageWorkUnit {
  tier: DashboardPriorityTier;
  stage: WorkflowStageView;
  instance: WorkflowStageInstanceView | null;
  group_id: string;
  group_name: string;
  phase_id: string | null;
  room_id: string | null;
  room_name: string | null;
  instance_name: string | null;
  status: PhaseStatus;
  estimated_hours: number;
  estimated_minutes: number;
  worked_minutes: number;
  progress_percent: number;
  last_activity_at: string | null;
  is_current_stage: boolean;
}

function todayIso(referenceDate: Date): string {
  return referenceDate.toISOString().slice(0, 10);
}

function isEligibleProject(project: ProjectWithClient): boolean {
  return (
    project.engagement_status !== "archived" &&
    project.engagement_status !== "completed" &&
    project.engagement_status !== "paused"
  );
}

function resolveInstanceName(
  instance: WorkflowStageInstanceView,
  executionMode: WorkflowStageView["execution_mode"]
): string | null {
  if (executionMode === "ROOMS") {
    return instance.room_name ?? instance.room_id;
  }

  if (executionMode === "DOCUMENTS") {
    return (
      instance.document_item_name ??
      instance.document_item_key ??
      instance.document_item_name
    );
  }

  return null;
}

function buildProjectHref(projectId: string): string {
  return `/projects/${projectId}`;
}

function classifyWorkflowUnits(workflow: ProjectWorkflowEngineView): StageWorkUnit[] {
  const units: StageWorkUnit[] = [];

  for (const group of workflow.groups) {
    if (!group.enabled) {
      continue;
    }

    for (const stage of group.stages) {
      if (!stage.enabled) {
        continue;
      }

      if (stage.execution_mode === "PROJECT") {
        if (stage.status === "completed") {
          continue;
        }

        const primaryInstance = stage.instances[0] ?? null;
        const tier: DashboardPriorityTier =
          stage.status === "blocked" ? "blocked" : stage.status === "in_progress"
            ? "current_project_stage"
            : "project_stages_waiting";

        units.push({
          tier,
          stage,
          instance: primaryInstance,
          group_id: group.id,
          group_name: group.name,
          phase_id: primaryInstance?.timer_target_id ?? null,
          room_id: null,
          room_name: null,
          instance_name: null,
          status: stage.status,
          estimated_hours: stage.estimated_hours,
          estimated_minutes: primaryInstance?.estimated_minutes ?? stage.estimated_hours * 60,
          worked_minutes: primaryInstance?.worked_minutes ?? 0,
          progress_percent: stage.progress_percent,
          last_activity_at: primaryInstance?.last_activity_at ?? null,
          is_current_stage: stage.is_current,
        });

        continue;
      }

      for (const instance of stage.instances) {
        if (instance.status === "completed") {
          continue;
        }

        const tier: DashboardPriorityTier =
          instance.status === "blocked"
            ? "blocked"
            : stage.execution_mode === "ROOMS"
              ? "room_tasks"
              : "document_tasks";

        units.push({
          tier,
          stage,
          instance,
          group_id: group.id,
          group_name: group.name,
          phase_id: instance.timer_target_id,
          room_id: instance.room_id,
          room_name: instance.room_name,
          instance_name: resolveInstanceName(instance, stage.execution_mode),
          status: instance.status,
          estimated_hours: instance.estimated_hours,
          estimated_minutes: instance.estimated_minutes,
          worked_minutes: instance.worked_minutes,
          progress_percent: instance.progress_percent,
          last_activity_at: instance.last_activity_at,
          is_current_stage: stage.is_current,
        });
      }
    }
  }

  return units;
}

function isActiveTimerTarget(input: {
  continueWorking: ContinueWorkingResult;
  project_id: string;
  phase_id: string | null;
}): boolean {
  if (input.continueWorking.kind !== "running" || !input.phase_id) {
    return false;
  }

  return (
    input.continueWorking.session.project_id === input.project_id &&
    input.continueWorking.session.phase_id === input.phase_id
  );
}

function isInstanceWaiting(
  instanceId: string | null | undefined,
  activeWaitingByInstanceId: Map<string, WorkflowWaitingEvent> | undefined
): boolean {
  if (!instanceId || !activeWaitingByInstanceId) {
    return false;
  }

  return activeWaitingByInstanceId.has(instanceId);
}

function buildWorkCandidate(input: {
  project: ProjectWithClient;
  unit: StageWorkUnit;
  continueWorking: ContinueWorkingResult;
  referenceDate: Date;
  activeWaitingByInstanceId?: Map<string, WorkflowWaitingEvent>;
}): PlanningWorkCandidate {
  const metrics = calculateStageMetrics({
    estimated_hours: input.unit.estimated_hours,
    progress_percent: input.unit.progress_percent,
    status: input.unit.status,
    deadline: input.project.design_deadline,
    reference_date: input.referenceDate,
  });

  const is_active_timer = isActiveTimerTarget({
    continueWorking: input.continueWorking,
    project_id: input.project.id,
    phase_id: input.unit.phase_id,
  });

  const remaining_minutes = Math.max(
    0,
    Math.round(
      input.unit.estimated_minutes * (1 - input.unit.progress_percent / 100)
    )
  );

  const is_waiting = isInstanceWaiting(
    input.unit.instance?.id,
    input.activeWaitingByInstanceId
  );

  const priority_score = calculatePriorityScore({
    remaining_minutes,
    worked_minutes: input.unit.worked_minutes,
    slack_days: metrics.slack_days,
    design_deadline: input.project.design_deadline,
    project_priority: input.project.priority,
    status: input.unit.status,
    is_active_timer,
    is_waiting,
    last_activity_at: input.unit.last_activity_at,
    reference_date: input.referenceDate,
  });

  const instanceKey = input.unit.instance?.id ?? "project";

  return {
    id: `${input.project.id}:${input.unit.stage.id}:${instanceKey}`,
    tier: input.unit.tier as PlanningWorkCandidate["tier"],
    project_id: input.project.id,
    project_name: input.project.name,
    project_number: input.project.project_number,
    project_priority: input.project.priority,
    design_deadline: input.project.design_deadline,
    group_id: input.unit.group_id,
    group_name: input.unit.group_name,
    stage_id: input.unit.stage.id,
    stage_name: input.unit.stage.name,
    execution_mode: input.unit.stage.execution_mode,
    instance_id: input.unit.instance?.id ?? null,
    instance_name: input.unit.instance_name,
    room_id: input.unit.room_id,
    room_name: input.unit.room_name,
    phase_id: input.unit.phase_id,
    status: input.unit.status,
    remaining_hours: metrics.remaining_hours,
    estimated_finish_date: metrics.estimated_finish_date,
    slack_days: metrics.slack_days,
    priority_score,
    is_active_timer,
    is_current_stage: input.unit.is_current_stage,
    href: buildProjectHref(input.project.id),
  };
}

function buildBlockedItem(input: {
  project: ProjectWithClient;
  unit: StageWorkUnit;
}): DashboardBlockedItem {
  const instanceKey = input.unit.instance?.id ?? "project";

  return {
    id: `blocked-${input.project.id}:${input.unit.stage.id}:${instanceKey}`,
    tier: "blocked",
    project_id: input.project.id,
    project_name: input.project.name,
    group_name: input.unit.group_name,
    stage_name: input.unit.stage.name,
    execution_mode: input.unit.stage.execution_mode,
    instance_name: input.unit.instance_name,
    phase_id: input.unit.phase_id,
    href: buildProjectHref(input.project.id),
  };
}

function collectDeadlines(
  projects: ProjectWithClient[],
  today: string
): DashboardDeadlineItem[] {
  const deadlines: DashboardDeadlineItem[] = [];

  for (const project of projects) {
    if (!isEligibleProject(project)) {
      continue;
    }

    const entries: Array<{ key: string; label: string; date: string | null }> = [
      {
        key: "design",
        label: bg.projects.wizard.designDeadline,
        date: project.design_deadline,
      },
      {
        key: "execution",
        label: bg.projects.wizard.executionDeadline,
        date: project.execution_deadline,
      },
      {
        key: "move_in",
        label: bg.projects.wizard.moveInDate,
        date: project.move_in_date,
      },
    ];

    for (const entry of entries) {
      if (!entry.date) {
        continue;
      }

      deadlines.push({
        id: `${project.id}-${entry.key}`,
        tier: "deadlines",
        project_id: project.id,
        project_name: project.name,
        label: entry.label,
        date_label: formatLongDate(entry.date),
        date_iso: entry.date,
        is_overdue: entry.date < today,
        href: buildProjectHref(project.id),
      });
    }
  }

  return deadlines.sort((left, right) => left.date_iso.localeCompare(right.date_iso));
}

function sortWorkCandidates(items: PlanningWorkCandidate[]): PlanningWorkCandidate[] {
  return [...items].sort((left, right) => {
    if (left.is_current_stage !== right.is_current_stage) {
      return left.is_current_stage ? -1 : 1;
    }

    if (right.priority_score !== left.priority_score) {
      return right.priority_score - left.priority_score;
    }

    return left.project_name.localeCompare(right.project_name, "bg");
  });
}

function collectWorkCandidates(
  input: BuildDashboardPrioritiesInput
): PlanningWorkCandidate[] {
  const referenceDate = input.referenceDate ?? new Date();
  const candidates: PlanningWorkCandidate[] = [];

  for (const project of input.projects) {
    if (!isEligibleProject(project)) {
      continue;
    }

    const workflow = input.workflows.get(project.id);

    if (!workflow) {
      continue;
    }

    for (const unit of classifyWorkflowUnits(workflow)) {
      if (unit.tier === "blocked") {
        continue;
      }

      if (
        isInstanceWaiting(unit.instance?.id, input.activeWaitingByInstanceId)
      ) {
        continue;
      }

      candidates.push(
        buildWorkCandidate({
          project,
          unit,
          continueWorking: input.continueWorking,
          referenceDate,
          activeWaitingByInstanceId: input.activeWaitingByInstanceId,
        })
      );
    }
  }

  return sortWorkCandidates(candidates);
}

export function buildTopWorkCandidates(
  input: BuildDashboardPrioritiesInput & { limit?: number }
): PlanningWorkCandidate[] {
  return collectWorkCandidates(input).slice(0, input.limit ?? 5);
}

export function buildDashboardPriorities(
  input: BuildDashboardPrioritiesInput
): DashboardPrioritiesView {
  const referenceDate = input.referenceDate ?? new Date();
  const today = todayIso(referenceDate);
  const workTierLimit = input.workTierLimit ?? 8;
  const waitingTierLimit = input.waitingTierLimit ?? 8;

  const workByTier = new Map<DashboardPriorityTier, PlanningWorkCandidate[]>();
  const blockedItems: DashboardBlockedItem[] = [];

  for (const project of input.projects) {
    if (!isEligibleProject(project)) {
      continue;
    }

    const workflow = input.workflows.get(project.id);

    if (!workflow) {
      continue;
    }

    for (const unit of classifyWorkflowUnits(workflow)) {
      if (unit.tier === "blocked") {
        blockedItems.push(
          buildBlockedItem({
            project,
            unit,
          })
        );
        continue;
      }

      if (
        isInstanceWaiting(unit.instance?.id, input.activeWaitingByInstanceId)
      ) {
        continue;
      }

      const candidate = buildWorkCandidate({
        project,
        unit,
        continueWorking: input.continueWorking,
        referenceDate,
        activeWaitingByInstanceId: input.activeWaitingByInstanceId,
      });

      const bucket = workByTier.get(candidate.tier) ?? [];
      bucket.push(candidate);
      workByTier.set(candidate.tier, bucket);
    }
  }

  const pausedItems: DashboardPausedItem[] = input.pausedSessions.map((session) => ({
    id: `paused-${session.session_id}`,
    tier: "paused",
    project_id: session.project_id,
    project_name: session.project_name,
    group_name: session.group_name,
    stage_name: session.stage_name,
    instance_name: session.instance_name,
    phase_id: session.phase_id,
    session_id: session.session_id,
    href: buildProjectHref(session.project_id),
  }));

  const deadlineItems = collectDeadlines(input.projects, today);

  const sections: DashboardPrioritySection[] = DASHBOARD_PRIORITY_TIER_ORDER.map(
    (tier) => {
      let items: DashboardPriorityItem[] = [];

      if (
        tier === "current_project_stage" ||
        tier === "project_stages_waiting" ||
        tier === "room_tasks" ||
        tier === "document_tasks"
      ) {
        items = sortWorkCandidates(workByTier.get(tier) ?? []).slice(0, workTierLimit);
      } else if (tier === "paused") {
        items = pausedItems.slice(0, waitingTierLimit);
      } else if (tier === "blocked") {
        items = blockedItems
          .sort((left, right) =>
            left.project_name.localeCompare(right.project_name, "bg")
          )
          .slice(0, waitingTierLimit);
      } else if (tier === "deadlines") {
        items = deadlineItems.slice(0, waitingTierLimit);
      }

      return { tier, items };
    }
  ).filter((section) => section.items.length > 0);

  return {
    sections,
    reference_date: today,
  };
}
