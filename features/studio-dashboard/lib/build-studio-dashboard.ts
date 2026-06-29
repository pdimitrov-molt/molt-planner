import type { ProjectWorkspace } from "@/features/projects/types/project-workspace";
import {
  getProjectObjectTypeLabel,
  type ProjectWithClient,
} from "@/features/projects/types/project";
import type {
  StudioDashboardView,
  StudioProjectRow,
  StudioProjectStatus,
  StudioSummaryCard,
  StudioTimelineStep,
  StudioTimelineStepState,
  StudioWorkflowGroupRow,
  StudioContinueWorkingView,
  StudioDashboardBlockedItem,
  StudioDashboardDeadlineItem,
  StudioDashboardPausedItem,
  StudioDashboardPrioritySection,
  StudioTodayWorkItem,
} from "@/features/studio-dashboard/types/studio-dashboard-view";
import type { ProjectWorkflowEngineView } from "@/features/workflow-engine/types/workflow-engine";
import { findWorkflowContextForPhase } from "@/features/workflow-engine/lib/find-workflow-context";
import type { ContinueWorkingResult } from "@/features/work-sessions/types/continue-working";
import { buildDashboardPriorities } from "@/features/planning-engine/lib/build-dashboard-priorities";
import type {
  DashboardBlockedItem,
  DashboardDeadlineItem,
  DashboardPausedItem,
  DashboardPriorityTier,
  PlanningWorkCandidate,
} from "@/features/planning-engine/types/planning-engine";
import type { PausedWorkflowSession } from "@/features/planning-engine/lib/build-dashboard-priorities";
import { bg } from "@/src/i18n/bg";
import { formatArea } from "@/src/i18n/format";

interface BuildStudioDashboardInput {
  projects: ProjectWithClient[];
  workspaces: ProjectWorkspace[];
  workflows: Map<string, ProjectWorkflowEngineView>;
  continueWorking: ContinueWorkingResult;
  pausedSessions: PausedWorkflowSession[];
  referenceDate?: Date;
}

function todayIso(referenceDate: Date): string {
  return referenceDate.toISOString().slice(0, 10);
}

function formatAreaLabel(area: number | null): string {
  if (area === null) {
    return bg.common.areaNotSet;
  }

  return formatArea(area);
}

function mapStatusToTimelineState(
  status: StudioProjectStatus | "not_started" | "in_progress" | "blocked" | "completed",
  isCurrent: boolean
): StudioTimelineStepState {
  if (status === "completed") {
    return "completed";
  }

  if (status === "blocked") {
    return "waiting";
  }

  if (isCurrent || status === "in_progress") {
    return "current";
  }

  return "future";
}

function buildGroupTimeline(
  workflow: ProjectWorkflowEngineView | null
): StudioTimelineStep[] {
  if (!workflow) {
    return [];
  }

  return workflow.groups
    .filter((group) => group.enabled)
    .map((group) => ({
      id: group.id,
      label: group.name,
      state: mapStatusToTimelineState(group.status, group.is_current),
    }));
}

function buildWorkflowGroupRows(
  workflow: ProjectWorkflowEngineView | null
): StudioWorkflowGroupRow[] {
  if (!workflow) {
    return [];
  }

  return workflow.groups
    .filter((group) => group.enabled)
    .map((group) => ({
      id: group.id,
      name: group.name,
      progress_percent: group.progress_percent,
      status_label: bg.labels.phaseStatus[group.status],
      current_stage_label:
        group.stages.find((stage) => stage.is_current)?.name ??
        group.stages.find((stage) => stage.enabled && stage.progress_percent < 100)?.name ??
        null,
    }));
}

function projectHasOverduePhases(
  workspace: ProjectWorkspace | null,
  today: string
): boolean {
  if (!workspace) {
    return false;
  }

  return workspace.rooms.some((room) =>
    room.phases.some(
      (phase) =>
        phase.target_end_date &&
        phase.target_end_date < today &&
        phase.status !== "completed"
    )
  );
}

function projectHasWaiting(workspace: ProjectWorkspace | null): boolean {
  if (!workspace) {
    return false;
  }

  return (
    workspace.waiting_items.length > 0 ||
    workspace.rooms.some((room) =>
      room.phases.some((phase) => phase.status === "blocked")
    )
  );
}

function projectHasInProgress(
  workspace: ProjectWorkspace | null,
  workflow: ProjectWorkflowEngineView | null
): boolean {
  if (workflow?.groups.some((group) => group.status === "in_progress")) {
    return true;
  }

  if (!workspace) {
    return false;
  }

  return workspace.rooms.some((room) =>
    room.phases.some((phase) => phase.status === "in_progress")
  );
}

function resolveProjectStatus(input: {
  project: ProjectWithClient;
  workspace: ProjectWorkspace | null;
  workflow: ProjectWorkflowEngineView | null;
  today: string;
}): StudioProjectStatus {
  if (
    input.project.engagement_status === "completed" ||
    input.workspace?.is_completed
  ) {
    return "completed";
  }

  if (projectHasOverduePhases(input.workspace, input.today)) {
    return "overdue";
  }

  if (projectHasWaiting(input.workspace)) {
    return "waiting";
  }

  if (projectHasInProgress(input.workspace, input.workflow)) {
    return "in_progress";
  }

  if (input.project.engagement_status === "paused") {
    return "paused";
  }

  if (input.project.engagement_status === "inquiry") {
    return "inquiry";
  }

  return "active";
}

const STATUS_LABELS: Record<StudioProjectStatus, string> =
  bg.studioDashboard.projectStatus;

function buildProjectRow(input: {
  project: ProjectWithClient;
  workspace: ProjectWorkspace | null;
  workflow: ProjectWorkflowEngineView | null;
  today: string;
}): StudioProjectRow {
  const status = resolveProjectStatus(input);

  return {
    id: input.project.id,
    name: input.project.name,
    project_number: input.project.project_number,
    object_type_label: getProjectObjectTypeLabel(input.project.object_type),
    area_label: input.workspace?.site_area_label ?? formatAreaLabel(input.project.site_area),
    engagement_status: input.project.engagement_status,
    status,
    status_label: STATUS_LABELS[status],
    progress_percent: input.workflow?.progress_percent ?? input.workspace?.overall_completion_percent ?? 0,
    timeline: buildGroupTimeline(input.workflow),
    workflow_groups: buildWorkflowGroupRows(input.workflow),
    current_group_name: input.workflow?.current?.group_name ?? null,
    current_stage_name: input.workflow?.current?.stage_name ?? null,
    current_room_name: input.workflow?.current?.room_name ?? null,
    href: `/projects/${input.project.id}`,
  };
}

function buildSummary(projects: StudioProjectRow[]): StudioSummaryCard[] {
  const total = projects.length;
  const active = projects.filter(
    (project) => project.engagement_status === "active"
  ).length;

  return [
    { id: "active", value: active, total, accent: "green" },
    {
      id: "in_progress",
      value: projects.filter((project) => project.status === "in_progress").length,
      accent: "blue",
    },
    {
      id: "waiting",
      value: projects.filter((project) => project.status === "waiting").length,
      accent: "orange",
    },
    {
      id: "overdue",
      value: projects.filter((project) => project.status === "overdue").length,
      accent: "red",
    },
  ];
}

function sortProjects(rows: StudioProjectRow[]): StudioProjectRow[] {
  const statusOrder: Record<StudioProjectStatus, number> = {
    overdue: 0,
    in_progress: 1,
    waiting: 2,
    active: 3,
    inquiry: 4,
    paused: 5,
    completed: 6,
  };

  return [...rows].sort((left, right) => {
    const statusDiff = statusOrder[left.status] - statusOrder[right.status];

    if (statusDiff !== 0) {
      return statusDiff;
    }

    return left.name.localeCompare(right.name, "bg");
  });
}

function buildContinueWorkingView(input: {
  continueWorking: ContinueWorkingResult;
  workflows: Map<string, ProjectWorkflowEngineView>;
}): StudioContinueWorkingView | null {
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
    href: `/projects/${session.project_id}`,
    session_id: session.session_id,
    started_at: session.started_at,
  };
}

const PRIORITY_SECTION_COPY: Record<
  DashboardPriorityTier,
  { title: string; subtitle: string }
> = {
  current_project_stage: bg.planningEngine.prioritySections.currentProjectStage,
  project_stages_waiting: bg.planningEngine.prioritySections.projectStagesWaiting,
  room_tasks: bg.planningEngine.prioritySections.roomTasks,
  document_tasks: bg.planningEngine.prioritySections.documentTasks,
  paused: bg.planningEngine.prioritySections.paused,
  blocked: bg.planningEngine.prioritySections.blocked,
  deadlines: bg.planningEngine.prioritySections.deadlines,
};

function mapWorkItem(item: PlanningWorkCandidate, rank: number): StudioTodayWorkItem {
  return {
    id: item.id,
    rank,
    tier: item.tier,
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
    estimated_finish_date: item.estimated_finish_date,
    slack_days: item.slack_days,
    priority_score: item.priority_score,
    is_active_timer: item.is_active_timer,
    href: item.href,
  };
}

function mapPausedItem(item: DashboardPausedItem): StudioDashboardPausedItem {
  return {
    id: item.id,
    project_id: item.project_id,
    project_name: item.project_name,
    group_name: item.group_name,
    stage_name: item.stage_name,
    instance_name: item.instance_name,
    href: item.href,
  };
}

function mapBlockedItem(item: DashboardBlockedItem): StudioDashboardBlockedItem {
  return {
    id: item.id,
    project_id: item.project_id,
    project_name: item.project_name,
    group_name: item.group_name,
    stage_name: item.stage_name,
    instance_name: item.instance_name,
    href: item.href,
  };
}

function mapDeadlineItem(item: DashboardDeadlineItem): StudioDashboardDeadlineItem {
  return {
    id: item.id,
    project_id: item.project_id,
    project_name: item.project_name,
    label: item.label,
    date_label: item.date_label,
    is_overdue: item.is_overdue,
    href: item.href,
  };
}

function buildPrioritySections(input: {
  projects: ProjectWithClient[];
  workflows: Map<string, ProjectWorkflowEngineView>;
  continueWorking: ContinueWorkingResult;
  pausedSessions: PausedWorkflowSession[];
  referenceDate: Date;
}): StudioDashboardPrioritySection[] {
  const dashboard = buildDashboardPriorities({
    projects: input.projects,
    workflows: input.workflows,
    continueWorking: input.continueWorking,
    pausedSessions: input.pausedSessions,
    referenceDate: input.referenceDate,
  });

  return dashboard.sections.map((section) => {
    const copy = PRIORITY_SECTION_COPY[section.tier];
    const workItems: StudioTodayWorkItem[] = [];
    const pausedItems: StudioDashboardPausedItem[] = [];
    const blockedItems: StudioDashboardBlockedItem[] = [];
    const deadlineItems: StudioDashboardDeadlineItem[] = [];

    for (const item of section.items) {
      if ("priority_score" in item) {
        workItems.push(mapWorkItem(item, workItems.length + 1));
      } else if (item.tier === "paused") {
        pausedItems.push(mapPausedItem(item));
      } else if (item.tier === "blocked") {
        blockedItems.push(mapBlockedItem(item));
      } else if (item.tier === "deadlines") {
        deadlineItems.push(mapDeadlineItem(item));
      }
    }

    return {
      tier: section.tier,
      title: copy.title,
      subtitle: copy.subtitle,
      workItems,
      pausedItems,
      blockedItems,
      deadlineItems,
    };
  });
}

export function buildStudioDashboard(
  input: BuildStudioDashboardInput
): StudioDashboardView {
  const referenceDate = input.referenceDate ?? new Date();
  const today = todayIso(referenceDate);
  const workspaceById = new Map(
    input.workspaces.map((workspace) => [workspace.id, workspace])
  );

  const projects = sortProjects(
    input.projects.map((project) =>
      buildProjectRow({
        project,
        workspace: workspaceById.get(project.id) ?? null,
        workflow: input.workflows.get(project.id) ?? null,
        today,
      })
    )
  );

  return {
    summary: buildSummary(projects),
    prioritySections: buildPrioritySections({
      projects: input.projects,
      workflows: input.workflows,
      continueWorking: input.continueWorking,
      pausedSessions: input.pausedSessions,
      referenceDate,
    }),
    projects,
    continueWorking: buildContinueWorkingView(input),
  };
}
