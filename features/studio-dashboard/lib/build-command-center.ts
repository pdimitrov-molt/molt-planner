import { format, parseISO, differenceInCalendarDays } from "date-fns";

import { calculateSlackDays } from "@/features/planning-engine/lib/calculate-stage-metrics";
import {
  buildTopWorkCandidates,
  type PausedWorkflowSession,
} from "@/features/planning-engine/lib/build-dashboard-priorities";
import { CapacityCalculator } from "@/features/planner/capacity-calculator";
import { WEEKLY_CAPACITY_HOURS } from "@/features/planner/capacity";
import type { ProjectWorkspace } from "@/features/projects/types/project-workspace";
import type { ProjectWithClient } from "@/features/projects/types/project";
import type { PlanningWorkCandidate } from "@/features/planning-engine/types/planning-engine";
import { findWorkflowContextForPhase } from "@/features/workflow-engine/lib/find-workflow-context";
import { buildActiveWaitingByInstanceId } from "@/features/workflow-engine/lib/resolve-active-waiting";
import { getWaitingReasonLabel } from "@/features/workflow-engine/lib/waiting-reason-labels";
import type { ProjectWorkflowEngineView } from "@/features/workflow-engine/types/workflow-engine";
import type { WorkflowWaitingEvent } from "@/features/workflow-engine/types/workflow-waiting-event";
import {
  extractWorkSessionContext,
  formatSessionTimeRange,
  getSessionDurationMinutes,
} from "@/features/work-sessions/lib/build-work-session-log";
import { formatWorkDurationMinutes } from "@/features/work-sessions/lib/format-work-duration";
import type { WorkSessionWithContextRow } from "@/features/work-sessions/types/work-session-log";
import type { ContinueWorkingResult } from "@/features/work-sessions/types/continue-working";
import type {
  CommandCenterActiveProject,
  CommandCenterAtRiskProject,
  CommandCenterBackgroundView,
  CommandCenterCapacity,
  CommandCenterContinueWorking,
  CommandCenterCriticalView,
  CommandCenterFocusItem,
  CommandCenterRecentActivity,
  CommandCenterRecentCompletedProject,
  CommandCenterRecentCompletedStage,
  CommandCenterRecentSession,
  CommandCenterRiskStatus,
  CommandCenterView,
  CommandCenterWaitingGroup,
  CommandCenterWaitingItem,
} from "@/features/studio-dashboard/types/command-center-view";
import { bg } from "@/src/i18n/bg";
import { bgLocale, formatLongDate } from "@/src/i18n/format";

const capacityCalculator = new CapacityCalculator();

export interface BuildCommandCenterInput {
  projects: ProjectWithClient[];
  workspaces: ProjectWorkspace[];
  workflows: Map<string, ProjectWorkflowEngineView>;
  activeWaitingEvents: WorkflowWaitingEvent[];
  continueWorking: ContinueWorkingResult;
  pausedSessions: PausedWorkflowSession[];
  recentSessions: WorkSessionWithContextRow[];
  referenceDate?: Date;
}

function todayIso(referenceDate: Date): string {
  return referenceDate.toISOString().slice(0, 10);
}

function isActiveProject(project: ProjectWithClient): boolean {
  return (
    project.engagement_status === "active" ||
    project.engagement_status === "inquiry"
  );
}

function isEligibleForPlanning(project: ProjectWithClient): boolean {
  return (
    project.engagement_status !== "archived" &&
    project.engagement_status !== "completed" &&
    project.engagement_status !== "paused"
  );
}

function buildProjectHref(projectId: string): string {
  return `/projects/${projectId}`;
}

function mapFocusItem(item: PlanningWorkCandidate, rank: number): CommandCenterFocusItem {
  return {
    id: item.id,
    rank,
    project_id: item.project_id,
    project_name: item.project_name,
    project_number: item.project_number,
    group_name: item.group_name,
    stage_name: item.stage_name,
    execution_mode: item.execution_mode,
    instance_name: item.instance_name,
    room_name: item.room_name,
    status: item.status,
    status_label: bg.labels.phaseStatus[item.status],
    remaining_hours: item.remaining_hours,
    priority_score: item.priority_score,
    is_active_timer: item.is_active_timer,
    href: item.href,
  };
}

function buildPlannerScoreByProject(
  candidates: PlanningWorkCandidate[]
): Map<string, number> {
  const scores = new Map<string, number>();

  for (const candidate of candidates) {
    const current = scores.get(candidate.project_id) ?? 0;
    scores.set(candidate.project_id, Math.max(current, candidate.priority_score));
  }

  return scores;
}

function buildActiveProjects(input: {
  projects: ProjectWithClient[];
  workspaces: ProjectWorkspace[];
  workflows: Map<string, ProjectWorkflowEngineView>;
  plannerScores: Map<string, number>;
  activeWaitingByInstanceId: Map<string, WorkflowWaitingEvent>;
}): CommandCenterActiveProject[] {
  const workspaceById = new Map(input.workspaces.map((entry) => [entry.id, entry]));

  return input.projects
    .filter(isActiveProject)
    .map((project) => {
      const workspace = workspaceById.get(project.id) ?? null;
      const workflow = input.workflows.get(project.id) ?? null;
      const currentInstanceId = workflow?.current?.instance_id ?? null;
      const activeWaiting = currentInstanceId
        ? input.activeWaitingByInstanceId.get(currentInstanceId) ?? null
        : null;
      const currentStageName = activeWaiting
        ? `⏸ ${getWaitingReasonLabel(activeWaiting.reason, activeWaiting.custom_reason)}`
        : workflow?.current?.stage_name ?? null;

      return {
        id: project.id,
        name: project.name,
        project_number: project.project_number,
        progress_percent:
          workflow?.progress_percent ?? workspace?.overall_completion_percent ?? 0,
        current_group_name: workflow?.current?.group_name ?? null,
        current_stage_name: currentStageName,
        remaining_hours: workspace?.remaining_phase_hours ?? 0,
        deadline_label: workspace?.design_deadline_label ?? bg.common.empty,
        planner_score: input.plannerScores.get(project.id) ?? 0,
        href: buildProjectHref(project.id),
      };
    })
    .sort((left, right) => {
      if (right.planner_score !== left.planner_score) {
        return right.planner_score - left.planner_score;
      }

      return left.name.localeCompare(right.name, "bg");
    });
}

function resolveRiskStatus(input: {
  design_deadline: string | null;
  slack_days: number | null;
  today: string;
}): CommandCenterRiskStatus {
  if (input.design_deadline && input.design_deadline < input.today) {
    return "overdue";
  }

  if (input.slack_days === null) {
    return "on_track";
  }

  if (input.slack_days < 0) {
    return "overdue";
  }

  if (input.slack_days <= 7) {
    return "risk";
  }

  return "on_track";
}

const RISK_STATUS_LABELS: Record<CommandCenterRiskStatus, string> =
  bg.commandCenter.atRisk.status;

function buildAtRiskProjects(input: {
  projects: ProjectWithClient[];
  workspaces: ProjectWorkspace[];
  referenceDate: Date;
  today: string;
}): CommandCenterAtRiskProject[] {
  const workspaceById = new Map(input.workspaces.map((entry) => [entry.id, entry]));

  return input.projects
    .filter(isEligibleForPlanning)
    .map((project) => {
      const workspace = workspaceById.get(project.id) ?? null;
      const remainingHours = workspace?.remaining_phase_hours ?? 0;
      const completionDate = capacityCalculator.calculateCompletionDate(
        remainingHours,
        input.referenceDate
      );
      const estimatedFinishDate = format(completionDate, "yyyy-MM-dd");
      const slackDays = calculateSlackDays({
        estimated_finish_date: estimatedFinishDate,
        deadline: project.design_deadline,
      });
      const riskStatus = resolveRiskStatus({
        design_deadline: project.design_deadline,
        slack_days: slackDays,
        today: input.today,
      });

      return {
        id: project.id,
        name: project.name,
        project_number: project.project_number,
        forecast_finish_label:
          workspace?.estimated_project_completion_label ??
          formatLongDate(estimatedFinishDate),
        deadline_label: workspace?.design_deadline_label ?? bg.common.empty,
        risk_status: riskStatus,
        risk_status_label: RISK_STATUS_LABELS[riskStatus],
        slack_days: slackDays,
        href: buildProjectHref(project.id),
      };
    })
    .filter((project) => project.risk_status !== "on_track")
    .sort((left, right) => {
      const statusOrder: Record<CommandCenterRiskStatus, number> = {
        overdue: 0,
        risk: 1,
        on_track: 2,
      };

      const statusDiff = statusOrder[left.risk_status] - statusOrder[right.risk_status];

      if (statusDiff !== 0) {
        return statusDiff;
      }

      const leftSlack = left.slack_days ?? Number.MAX_SAFE_INTEGER;
      const rightSlack = right.slack_days ?? Number.MAX_SAFE_INTEGER;

      return leftSlack - rightSlack;
    });
}

function resolveWaitingStageName(
  event: WorkflowWaitingEvent,
  workflow: ProjectWorkflowEngineView | null
): string {
  if (!workflow) {
    return bg.common.empty;
  }

  for (const group of workflow.groups) {
    for (const stage of group.stages) {
      const instance = stage.instances.find(
        (entry) => entry.id === event.workflow_instance_id
      );

      if (!instance) {
        continue;
      }

      if (stage.execution_mode === "ROOMS" && instance.room_name) {
        return `${stage.name} · ${instance.room_name}`;
      }

      if (stage.execution_mode === "DOCUMENTS") {
        const documentLabel =
          instance.document_item_name ?? instance.document_item_key ?? stage.name;

        return `${stage.name} · ${documentLabel}`;
      }

      return stage.name;
    }
  }

  return bg.common.empty;
}

function buildWaitingGroups(input: {
  projects: ProjectWithClient[];
  workflows: Map<string, ProjectWorkflowEngineView>;
  activeWaitingEvents: WorkflowWaitingEvent[];
  referenceDate: Date;
}): CommandCenterWaitingGroup[] {
  const projectById = new Map(input.projects.map((project) => [project.id, project]));
  const items: CommandCenterWaitingItem[] = input.activeWaitingEvents
    .map((event) => {
      const project = projectById.get(event.project_id);

      if (!project) {
        return null;
      }

      const workflow = input.workflows.get(event.project_id) ?? null;
      const daysWaiting = Math.max(
        0,
        differenceInCalendarDays(input.referenceDate, parseISO(event.started_at))
      );

      return {
        id: event.id,
        project_id: event.project_id,
        project_name: project.name,
        stage_name: resolveWaitingStageName(event, workflow),
        reason_label: getWaitingReasonLabel(event.reason, event.custom_reason),
        days_waiting: daysWaiting,
        days_waiting_label: bg.commandCenter.waiting.daysWaitingValue(daysWaiting),
        started_at_label: formatLongDate(event.started_at),
        expected_date_label: event.expected_end_at
          ? formatLongDate(event.expected_end_at)
          : null,
        href: buildProjectHref(event.project_id),
      };
    })
    .filter((item): item is CommandCenterWaitingItem => item !== null)
    .sort((left, right) => {
      if (right.days_waiting !== left.days_waiting) {
        return right.days_waiting - left.days_waiting;
      }

      return left.project_name.localeCompare(right.project_name, "bg");
    });

  if (items.length === 0) {
    return [];
  }

  return [
    {
      title: bg.commandCenter.waiting.title,
      items: items.slice(0, 20),
    },
  ];
}

function buildCapacity(workspaces: ProjectWorkspace[]): CommandCenterCapacity {
  const totalRemaining = workspaces.reduce(
    (total, workspace) => total + workspace.remaining_phase_hours,
    0
  );

  const thisWeekHours = Math.min(totalRemaining, WEEKLY_CAPACITY_HOURS);
  const nextWeekHours = Math.min(
    Math.max(0, totalRemaining - WEEKLY_CAPACITY_HOURS),
    WEEKLY_CAPACITY_HOURS
  );

  return {
    this_week_hours: Math.round(thisWeekHours * 10) / 10,
    next_week_hours: Math.round(nextWeekHours * 10) / 10,
    total_remaining_hours: Math.round(totalRemaining * 10) / 10,
  };
}

function buildRecentSessions(
  rows: WorkSessionWithContextRow[],
  workflows: Map<string, ProjectWorkflowEngineView>,
  referenceDate: Date
): CommandCenterRecentSession[] {
  return rows.slice(0, 6).map((row) => {
    const context = extractWorkSessionContext(row);
    const workflow = workflows.get(row.project_id);
    const workflowContext = workflow
      ? findWorkflowContextForPhase(workflow, row.phase_id)
      : null;
    const durationMinutes = getSessionDurationMinutes(
      {
        started_at: row.started_at,
        ended_at: row.ended_at,
        duration_minutes: row.duration_minutes,
        status: row.status as "running" | "paused" | "completed",
      },
      referenceDate
    );

    const contextLabel = workflowContext
      ? [workflowContext.group_name, workflowContext.stage_name, workflowContext.room_name]
          .filter(Boolean)
          .join(" · ")
      : context.room_name
        ? `${context.room_name} · ${context.phase_kind}`
        : context.phase_kind;

    return {
      id: row.id,
      project_name: context.project_name,
      context_label: contextLabel,
      worked_duration_label: formatWorkDurationMinutes(durationMinutes),
      time_label: formatSessionTimeRange(
        {
          started_at: row.started_at,
          ended_at: row.ended_at,
          status: row.status as "running" | "paused" | "completed",
        },
        referenceDate
      ),
      href: buildProjectHref(row.project_id),
    };
  });
}

function buildRecentCompletedStages(
  projects: ProjectWithClient[],
  workflows: Map<string, ProjectWorkflowEngineView>
): CommandCenterRecentCompletedStage[] {
  const stages: Array<CommandCenterRecentCompletedStage & { completed_at: string }> = [];

  for (const project of projects) {
    const workflow = workflows.get(project.id);

    if (!workflow) {
      continue;
    }

    for (const group of workflow.groups) {
      for (const stage of group.stages) {
        for (const instance of stage.instances) {
          if (instance.status !== "completed" || !instance.completed_at) {
            continue;
          }

          stages.push({
            id: instance.id,
            project_name: project.name,
            group_name: group.name,
            stage_name: stage.name,
            instance_name:
              instance.room_name ?? instance.document_item_name ?? null,
            completed_at_label: format(parseISO(instance.completed_at), "d MMM, HH:mm", {
              locale: bgLocale,
            }),
            completed_at: instance.completed_at,
            href: buildProjectHref(project.id),
          });
        }
      }
    }
  }

  return stages
    .sort((left, right) => Date.parse(right.completed_at) - Date.parse(left.completed_at))
    .slice(0, 6)
    .map(({ completed_at: _completedAt, ...entry }) => entry);
}

function buildRecentCompletedProjects(
  projects: ProjectWithClient[]
): CommandCenterRecentCompletedProject[] {
  return projects
    .filter((project) => project.engagement_status === "completed")
    .sort((left, right) => Date.parse(right.updated_at) - Date.parse(left.updated_at))
    .slice(0, 6)
    .map((project) => ({
      id: project.id,
      name: project.name,
      project_number: project.project_number,
      completed_at_label: format(parseISO(project.updated_at), "d MMM yyyy", {
        locale: bgLocale,
      }),
      href: buildProjectHref(project.id),
    }));
}

function buildContinueWorkingView(input: {
  continueWorking: ContinueWorkingResult;
  workflows: Map<string, ProjectWorkflowEngineView>;
}): CommandCenterContinueWorking | null {
  if (input.continueWorking.kind !== "running") {
    return null;
  }

  const session = input.continueWorking.session;
  const workflow = input.workflows.get(session.project_id);
  const context = workflow
    ? findWorkflowContextForPhase(workflow, session.phase_id)
    : null;

  return {
    project_name: session.project_name,
    group_name: context?.group_name ?? session.phase_label,
    stage_name: context?.stage_name ?? session.phase_label,
    room_name: context?.room_name ?? session.room_name,
    href: buildProjectHref(session.project_id),
    session_id: session.session_id,
    started_at: session.started_at,
  };
}

export interface ResolvedCommandCenterPlanning {
  referenceDate: Date;
  activeWaitingByInstanceId: Map<string, WorkflowWaitingEvent>;
  allCandidates: PlanningWorkCandidate[];
  plannerScores: Map<string, number>;
}

export function resolveCommandCenterPlanning(
  input: BuildCommandCenterInput
): ResolvedCommandCenterPlanning {
  const referenceDate = input.referenceDate ?? new Date();
  const activeWaitingByInstanceId = buildActiveWaitingByInstanceId(
    input.activeWaitingEvents
  );

  const allCandidates = buildTopWorkCandidates({
    projects: input.projects,
    workflows: input.workflows,
    continueWorking: input.continueWorking,
    pausedSessions: input.pausedSessions,
    activeWaitingByInstanceId,
    referenceDate,
    limit: 100,
  });

  return {
    referenceDate,
    activeWaitingByInstanceId,
    allCandidates,
    plannerScores: buildPlannerScoreByProject(allCandidates),
  };
}

export function buildCommandCenterCritical(
  input: BuildCommandCenterInput,
  planning: ResolvedCommandCenterPlanning = resolveCommandCenterPlanning(input),
  cached?: CommandCenterCacheableDerived
): CommandCenterCriticalView {
  return {
    continue_working: buildContinueWorkingView(input),
    todays_focus: planning.allCandidates
      .slice(0, 5)
      .map((item, index) => mapFocusItem(item, index + 1)),
    at_risk_projects:
      cached?.at_risk_projects ??
      buildAtRiskProjects({
        projects: input.projects,
        workspaces: input.workspaces,
        referenceDate: planning.referenceDate,
        today: todayIso(planning.referenceDate),
      }),
    waiting_groups:
      cached?.waiting_groups ??
      buildWaitingGroups({
        projects: input.projects,
        workflows: input.workflows,
        activeWaitingEvents: input.activeWaitingEvents,
        referenceDate: planning.referenceDate,
      }),
  };
}

export interface CommandCenterCacheableDerived {
  background: CommandCenterBackgroundView;
  waiting_groups: CommandCenterWaitingGroup[];
  at_risk_projects: CommandCenterAtRiskProject[];
}

export function buildCommandCenterCacheableDerived(
  input: BuildCommandCenterInput
): CommandCenterCacheableDerived {
  const timerNeutralInput: BuildCommandCenterInput = {
    ...input,
    continueWorking: { kind: "empty" },
    pausedSessions: [],
  };
  const planning = resolveCommandCenterPlanning(timerNeutralInput);

  return {
    background: buildCommandCenterBackground(timerNeutralInput, planning),
    waiting_groups: buildWaitingGroups({
      projects: input.projects,
      workflows: input.workflows,
      activeWaitingEvents: input.activeWaitingEvents,
      referenceDate: planning.referenceDate,
    }),
    at_risk_projects: buildAtRiskProjects({
      projects: input.projects,
      workspaces: input.workspaces,
      referenceDate: planning.referenceDate,
      today: todayIso(planning.referenceDate),
    }),
  };
}

export function buildCommandCenterBackground(
  input: BuildCommandCenterInput,
  planning: ResolvedCommandCenterPlanning
): CommandCenterBackgroundView {
  return {
    active_projects: buildActiveProjects({
      projects: input.projects,
      workspaces: input.workspaces,
      workflows: input.workflows,
      plannerScores: planning.plannerScores,
      activeWaitingByInstanceId: planning.activeWaitingByInstanceId,
    }),
    capacity: buildCapacity(
      input.workspaces.filter((workspace) =>
        input.projects.some(
          (project) => project.id === workspace.id && isEligibleForPlanning(project)
        )
      )
    ),
  };
}

export function buildCommandCenter(input: BuildCommandCenterInput): CommandCenterView {
  const planning = resolveCommandCenterPlanning(input);
  const critical = buildCommandCenterCritical(input, planning);
  const background = buildCommandCenterBackground(input, planning);

  const recentActivity: CommandCenterRecentActivity = {
    sessions: buildRecentSessions(
      input.recentSessions,
      input.workflows,
      planning.referenceDate
    ),
    completed_stages: buildRecentCompletedStages(input.projects, input.workflows),
    completed_projects: buildRecentCompletedProjects(input.projects),
  };

  return {
    ...critical,
    ...background,
    recent_activity: recentActivity,
  };
}
