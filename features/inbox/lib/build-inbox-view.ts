import { differenceInCalendarDays, parseISO } from "date-fns";

import {
  buildTopWorkCandidates,
  type PausedWorkflowSession,
} from "@/features/planning-engine/lib/build-dashboard-priorities";
import type { ProjectWithClient } from "@/features/projects/types/project";
import type { PersonalItem, PersonalItemPriority } from "@/features/personal-items/types/personal-item";
import { buildActiveWaitingByInstanceId } from "@/features/workflow-engine/lib/resolve-active-waiting";
import { getWaitingReasonLabel } from "@/features/workflow-engine/lib/waiting-reason-labels";
import type { ProjectWorkflowEngineView } from "@/features/workflow-engine/types/workflow-engine";
import type { WorkflowWaitingEvent } from "@/features/workflow-engine/types/workflow-waiting-event";
import type { ContinueWorkingResult } from "@/features/work-sessions/types/continue-working";
import type {
  InboxFilter,
  InboxItem,
  InboxItemKind,
  InboxView,
} from "@/features/inbox/types/inbox-view";
import { bg } from "@/src/i18n/bg";
import { formatLongDate, formatShortDate } from "@/src/i18n/format";

const PERSONAL_PRIORITY_WEIGHT: Record<PersonalItemPriority, number> = {
  low: 0.25,
  normal: 0.5,
  high: 0.75,
  urgent: 1,
};

const PROJECT_PRIORITY_WEIGHT = {
  low: 0.25,
  normal: 0.5,
  high: 0.75,
  critical: 1,
} as const;

interface BuildInboxViewInput {
  projects: ProjectWithClient[];
  workflows: Map<string, ProjectWorkflowEngineView>;
  activeWaitingEvents: WorkflowWaitingEvent[];
  personalItems: PersonalItem[];
  continueWorking: ContinueWorkingResult;
  pausedSessions: PausedWorkflowSession[];
  referenceDate?: Date;
}

function isEligibleProject(project: ProjectWithClient): boolean {
  return (
    project.engagement_status !== "archived" &&
    project.engagement_status !== "completed" &&
    project.engagement_status !== "paused"
  );
}

function buildProjectHref(projectId: string): string {
  return `/projects/${projectId}`;
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

function formatDeadlineLabel(dateIso: string | null): string | null {
  if (!dateIso) {
    return null;
  }

  return formatShortDate(dateIso);
}

function compareDeadline(left: string | null, right: string | null): number {
  if (left === right) {
    return 0;
  }

  if (!left) {
    return 1;
  }

  if (!right) {
    return -1;
  }

  return left.localeCompare(right);
}

function sortInboxItems(items: InboxItem[]): InboxItem[] {
  return [...items].sort((left, right) => {
    if (right.planner_score !== left.planner_score) {
      return right.planner_score - left.planner_score;
    }

    const deadlineDiff = compareDeadline(left.deadline_iso, right.deadline_iso);

    if (deadlineDiff !== 0) {
      return deadlineDiff;
    }

    if (right.priority_weight !== left.priority_weight) {
      return right.priority_weight - left.priority_weight;
    }

    return left.title.localeCompare(right.title, "bg");
  });
}

function buildProjectItems(input: BuildInboxViewInput): InboxItem[] {
  const referenceDate = input.referenceDate ?? new Date();
  const eligibleProjects = input.projects.filter(isEligibleProject);
  const activeWaitingByInstanceId = buildActiveWaitingByInstanceId(
    input.activeWaitingEvents
  );

  const candidates = buildTopWorkCandidates({
    projects: eligibleProjects,
    workflows: input.workflows,
    continueWorking: input.continueWorking,
    pausedSessions: input.pausedSessions,
    activeWaitingByInstanceId,
    referenceDate,
    limit: 500,
  });

  return candidates.map((candidate) => {
    const instanceSuffix = candidate.instance_name
      ? ` · ${candidate.instance_name}`
      : "";

    const deadlineIso =
      candidate.design_deadline ?? candidate.estimated_finish_date ?? null;

    return {
      id: `project:${candidate.id}`,
      kind: "project" as InboxItemKind,
      title: `${candidate.stage_name}${instanceSuffix}`,
      subtitle: `${candidate.project_name} · ${candidate.group_name}`,
      planner_score: candidate.priority_score,
      deadline_iso: deadlineIso,
      deadline_label: formatDeadlineLabel(deadlineIso),
      priority_weight: PROJECT_PRIORITY_WEIGHT[candidate.project_priority],
      priority_label: bg.labels.projectPriority[candidate.project_priority],
      status_label: bg.labels.phaseStatus[candidate.status],
      href: candidate.href,
      project_id: candidate.project_id,
    };
  });
}

function buildPersonalItems(personalItems: PersonalItem[]): InboxItem[] {
  return personalItems
    .filter((item) => item.status === "TODO" || item.status === "IN_PROGRESS")
    .map((item) => ({
      id: `personal:${item.id}`,
      kind: "personal" as InboxItemKind,
      title: item.title,
      subtitle: bg.personalItems.category[item.category],
      planner_score: 0,
      deadline_iso: item.due_date,
      deadline_label: formatDeadlineLabel(item.due_date),
      priority_weight: PERSONAL_PRIORITY_WEIGHT[item.priority],
      priority_label: bg.personalItems.priority[item.priority],
      status_label: bg.personalItems.status[item.status],
      href: "/personal",
      project_id: null,
    }));
}

function buildWaitingItems(input: BuildInboxViewInput): InboxItem[] {
  const referenceDate = input.referenceDate ?? new Date();
  const projectById = new Map(input.projects.map((project) => [project.id, project]));
  const items: InboxItem[] = [];

  for (const event of input.activeWaitingEvents) {
    const project = projectById.get(event.project_id);

    if (!project) {
      continue;
    }

    const workflow = input.workflows.get(event.project_id) ?? null;
    const stageName = resolveWaitingStageName(event, workflow);
    const reasonLabel = getWaitingReasonLabel(event.reason, event.custom_reason);
    const daysWaiting = Math.max(
      0,
      differenceInCalendarDays(referenceDate, parseISO(event.started_at))
    );

    items.push({
      id: `waiting:${event.id}`,
      kind: "waiting",
      title: stageName,
      subtitle: `${project.name} · ${reasonLabel}`,
      planner_score: 0,
      deadline_iso: event.expected_end_at,
      deadline_label: event.expected_end_at
        ? formatLongDate(event.expected_end_at)
        : null,
      priority_weight: PROJECT_PRIORITY_WEIGHT[project.priority],
      priority_label: bg.labels.projectPriority[project.priority],
      status_label: bg.inbox.waitingDays(daysWaiting),
      href: buildProjectHref(event.project_id),
      project_id: event.project_id,
    });
  }

  return items;
}

function buildCounts(items: InboxItem[]): Record<InboxFilter, number> {
  const projectCount = items.filter((item) => item.kind === "project").length;
  const personalCount = items.filter((item) => item.kind === "personal").length;
  const waitingCount = items.filter((item) => item.kind === "waiting").length;

  return {
    all: items.length,
    project: projectCount,
    personal: personalCount,
    waiting: waitingCount,
  };
}

export function buildInboxView(input: BuildInboxViewInput): InboxView {
  const referenceDate = input.referenceDate ?? new Date();
  const items = sortInboxItems([
    ...buildProjectItems(input),
    ...buildPersonalItems(input.personalItems),
    ...buildWaitingItems(input),
  ]);

  return {
    items,
    counts: buildCounts(items),
    reference_date: referenceDate.toISOString().slice(0, 10),
  };
}

export function filterInboxItems(
  items: InboxItem[],
  filter: InboxFilter
): InboxItem[] {
  if (filter === "all") {
    return items;
  }

  return items.filter((item) => item.kind === filter);
}
