import type {
  ActionCenterAction,
  ActionCenterDeadline,
  ActionCenterView,
  ActionCenterWaitingItem,
  PausedWorkSessionItem,
} from "@/features/dashboard/lib/build-action-center";
import type { ProjectWithClient } from "@/features/projects/types/project";
import type { ProjectWorkspace } from "@/features/projects/types/project-workspace";
import { adaptWorkspaceItemDisplay } from "@/features/studio-workflow/lib/adapt-workspace-item-display";
import { buildMockProjectWorkspaceItems } from "@/features/studio-workflow/lib/build-mock-project-workspace-items";
import { buildPrioritizedWorkflowActions } from "@/features/studio-workflow/lib/build-prioritized-workflow-actions";
import {
  buildRoomWorkspaceItems,
  getCurrentRoomWorkspaceItems,
} from "@/features/studio-workflow/lib/build-room-workspace-items";
import type { ContinueWorkingResult } from "@/features/work-sessions/types/continue-working";
import type { WorkSession } from "@/features/work-sessions/types/work-session";
import type {
  ProjectWorkspaceItem,
  RoomWorkspaceItem,
  WorkflowAction,
  WorkflowActionDisplay,
  WorkspaceItem,
} from "@/features/studio-workflow/types/workspace-item";
import { PROJECT_WORK_KIND_LABELS } from "@/features/studio-workflow/types/project-work-kind";
import { bg } from "@/src/i18n/bg";
import { formatLongDate } from "@/src/i18n/format";

export interface StudioWorkflowContext {
  projectItems: ProjectWorkspaceItem[];
  roomItems: RoomWorkspaceItem[];
  workspaceItems: WorkspaceItem[];
  nextActions: WorkflowAction[];
}

interface AdaptActionCenterInput {
  workspaces: ProjectWorkspace[];
  projects: ProjectWithClient[];
  continueWorking: ContinueWorkingResult;
  runningSession: WorkSession | null;
  pausedSessions: PausedWorkSessionItem[];
  referenceDate?: Date;
}

function todayIso(referenceDate: Date): string {
  return referenceDate.toISOString().slice(0, 10);
}

function buildRoomPhaseHref(
  projectId: string,
  roomId: string,
  phaseId: string
): string {
  return `/projects/${projectId}/rooms/${roomId}?focusPhase=${phaseId}`;
}

function adaptWorkflowAction(action: WorkflowAction): ActionCenterAction {
  const display = adaptWorkspaceItemDisplay(action.item);
  const roomItem = action.item.scope === "room" ? action.item : null;

  return {
    id: action.id,
    kind:
      action.kind === "overdue"
        ? "overdue_phase"
        : action.kind === "current"
          ? action.item.scope === "project"
            ? "current_phase"
            : "current_phase"
          : "no_started_work",
    priority: action.priority,
    project_id: action.item.project_id,
    project_name: action.item.project_name,
    room_id: roomItem?.room_id ?? "",
    room_name: roomItem?.room_name ?? display.title,
    phase_id: roomItem?.phase_id ?? action.item.id,
    phase_label: display.subtitle,
    recommended_action: action.recommended_action,
    cta_label: action.cta_label,
    cta_href: action.cta_href,
    workspace_item: action.item,
    display,
  };
}

function buildContinueDisplay(
  continueWorking: ContinueWorkingResult,
  roomItems: RoomWorkspaceItem[]
): WorkflowActionDisplay | null {
  if (continueWorking.kind !== "running") {
    return null;
  }

  const session = continueWorking.session;
  const roomItem = roomItems.find(
    (item) =>
      item.project_id === session.project_id &&
      item.room_id === session.room_id &&
      item.phase_id === session.phase_id
  );

  if (roomItem) {
    return adaptWorkspaceItemDisplay(roomItem);
  }

  return {
    title: session.phase_label,
    subtitle: bg.studioWorkflow.projectContext(session.project_name),
    scope: "room",
  };
}

function collectWaitingItems(
  workspaces: ProjectWorkspace[],
  projectItems: ProjectWorkspaceItem[],
  pausedSessions: PausedWorkSessionItem[]
): ActionCenterWaitingItem[] {
  const blockedProjectItems = projectItems
    .filter((item) => item.status === "blocked")
    .map((item) => ({
      id: `blocked-project-${item.id}`,
      kind: "blocked" as const,
      project_id: item.project_id,
      project_name: item.project_name,
      room_name: bg.studioWorkflow.projectScope,
      phase_label: item.label,
      title: item.label,
      context: bg.studioWorkflow.waiting.projectBlocked(item.project_name),
      href: `/projects/${item.project_id}`,
      workspace_item: item,
    }));

  const blockedItems = workspaces.flatMap((workspace) =>
    workspace.waiting_items.map((item) => {
      const roomItem = getCurrentRoomWorkspaceItems(
        buildRoomWorkspaceItems([workspace])
      ).find((entry) => entry.label === item.title);

      return {
        id: `blocked-${workspace.id}-${item.id}`,
        kind: "blocked" as const,
        project_id: workspace.id,
        project_name: workspace.name,
        room_name: item.room_name,
        phase_label: item.title,
        title: item.title,
        context: item.context,
        href: `/projects/${workspace.id}`,
        workspace_item: roomItem ?? undefined,
      };
    })
  );

  const pausedItems = pausedSessions.map((session) => ({
    id: `paused-${session.session_id}`,
    kind: "paused" as const,
    project_id: session.project_id,
    project_name: session.project_name,
    room_name: session.room_name,
    phase_label: session.phase_label,
    title: bg.actionCenter.waiting.pausedTitle(session.phase_label),
    context: bg.actionCenter.waiting.pausedContext(
      session.project_name,
      session.room_name
    ),
    href: buildRoomPhaseHref(
      session.project_id,
      session.room_id,
      session.phase_id
    ),
  }));

  return [...blockedProjectItems, ...blockedItems, ...pausedItems].slice(0, 8);
}

function collectDeadlines(
  projects: ProjectWithClient[],
  workspaces: ProjectWorkspace[],
  projectItems: ProjectWorkspaceItem[],
  roomItems: RoomWorkspaceItem[],
  today: string
): ActionCenterDeadline[] {
  const deadlines: ActionCenterDeadline[] = [];

  for (const item of projectItems) {
    if (!item.target_end_date || item.status === "completed") {
      continue;
    }

    deadlines.push({
      id: `project-work-${item.id}`,
      project_id: item.project_id,
      project_name: item.project_name,
      label: item.label,
      date_label: formatLongDate(item.target_end_date),
      date_iso: item.target_end_date,
      is_overdue: item.target_end_date < today,
      href: `/projects/${item.project_id}`,
      workspace_item: item,
    });
  }

  for (const project of projects) {
    const entries: Array<{ key: string; label: string; date: string | null }> =
      [
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
        project_id: project.id,
        project_name: project.name,
        label: entry.label,
        date_label: formatLongDate(entry.date),
        date_iso: entry.date,
        is_overdue: entry.date < today,
        href: `/projects/${project.id}`,
      });
    }
  }

  for (const item of roomItems) {
    if (!item.target_end_date || item.status === "completed") {
      continue;
    }

    deadlines.push({
      id: `phase-${item.phase_id}`,
      project_id: item.project_id,
      project_name: item.project_name,
      label: `${item.room_name} · ${item.label}`,
      date_label: formatLongDate(item.target_end_date),
      date_iso: item.target_end_date,
      is_overdue: item.target_end_date < today,
      href: buildRoomPhaseHref(item.project_id, item.room_id, item.phase_id),
      workspace_item: item,
    });
  }

  for (const workspace of workspaces) {
    for (const room of workspace.rooms) {
      for (const phase of room.phases) {
        if (!phase.target_end_date || phase.status === "completed") {
          continue;
        }

        if (deadlines.some((entry) => entry.id === `phase-${phase.id}`)) {
          continue;
        }

        deadlines.push({
          id: `phase-${phase.id}`,
          project_id: workspace.id,
          project_name: workspace.name,
          label: `${room.name} · ${phase.label}`,
          date_label: formatLongDate(phase.target_end_date),
          date_iso: phase.target_end_date,
          is_overdue: phase.target_end_date < today,
          href: buildRoomPhaseHref(workspace.id, room.id, phase.id),
        });
      }
    }
  }

  return deadlines
    .sort((left, right) => left.date_iso.localeCompare(right.date_iso))
    .slice(0, 8);
}

export function buildStudioWorkflowContext(
  input: AdaptActionCenterInput
): StudioWorkflowContext {
  const referenceDate = input.referenceDate ?? new Date();
  const today = todayIso(referenceDate);
  const roomItems = buildRoomWorkspaceItems(input.workspaces);
  const projectItems = buildMockProjectWorkspaceItems(
    input.projects,
    referenceDate
  );
  const workspaceItems: WorkspaceItem[] = [...projectItems, ...roomItems];
  const nextActions = buildPrioritizedWorkflowActions({
    projectItems: projectItems.filter((item) => item.status !== "completed"),
    roomItems,
    runningSession: input.runningSession,
    today,
  });

  return {
    projectItems,
    roomItems,
    workspaceItems,
    nextActions,
  };
}

export function adaptActionCenterView(
  input: AdaptActionCenterInput
): ActionCenterView {
  const referenceDate = input.referenceDate ?? new Date();
  const today = todayIso(referenceDate);
  const workflow = buildStudioWorkflowContext(input);

  return {
    continueWorking: input.continueWorking,
    continueWorkingDisplay: buildContinueDisplay(
      input.continueWorking,
      workflow.roomItems
    ),
    nextActions: workflow.nextActions.map(adaptWorkflowAction),
    waitingItems: collectWaitingItems(
      input.workspaces,
      workflow.projectItems,
      input.pausedSessions
    ),
    deadlines: collectDeadlines(
      input.projects,
      input.workspaces,
      workflow.projectItems,
      workflow.roomItems,
      today
    ),
  };
}

export function findWorkspaceItemByPhaseLabel(
  items: WorkspaceItem[],
  projectName: string,
  phaseLabel: string
): WorkspaceItem | null {
  return (
    items.find(
      (item) =>
        item.project_name === projectName &&
        ((item.scope === "room" && item.label === phaseLabel) ||
          (item.scope === "project" && item.label === phaseLabel))
    ) ?? null
  );
}

export { PROJECT_WORK_KIND_LABELS };
