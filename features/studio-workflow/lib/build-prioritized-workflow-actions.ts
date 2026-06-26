import type { WorkSession } from "@/features/work-sessions/types/work-session";
import type {
  ProjectWorkspaceItem,
  RoomWorkspaceItem,
  WorkflowAction,
  WorkflowActionKind,
  WorkspaceItem,
} from "@/features/studio-workflow/types/workspace-item";
import { bg } from "@/src/i18n/bg";

const PRIORITY: Record<
  "project_current" | "room_current" | "project_new" | "room_new" | "overdue",
  number
> = {
  project_current: 1,
  room_current: 2,
  project_new: 3,
  room_new: 4,
  overdue: 5,
};

function buildProjectHref(projectId: string): string {
  return `/projects/${projectId}`;
}

function buildRoomPhaseHref(
  projectId: string,
  roomId: string,
  phaseId: string
): string {
  return `/projects/${projectId}/rooms/${roomId}?focusPhase=${phaseId}`;
}

function actionMeta(
  item: WorkspaceItem,
  kind: WorkflowActionKind
): Pick<WorkflowAction, "recommended_action" | "cta_label" | "cta_href"> {
  if (item.scope === "project") {
    return {
      recommended_action:
        kind === "overdue"
          ? bg.studioWorkflow.actions.overdueProject
          : kind === "current"
            ? bg.studioWorkflow.actions.currentProject
            : bg.studioWorkflow.actions.startProject,
      cta_label: bg.actionCenter.actions.openPhase,
      cta_href: buildProjectHref(item.project_id),
    };
  }

  return {
    recommended_action:
      kind === "overdue"
        ? bg.actionCenter.actions.overduePhase
        : kind === "current"
          ? bg.actionCenter.actions.currentPhase
          : bg.actionCenter.actions.noStartedWork,
    cta_label: bg.actionCenter.actions.startWork,
    cta_href: buildRoomPhaseHref(item.project_id, item.room_id, item.phase_id),
  };
}

function pushAction(
  candidates: WorkflowAction[],
  item: WorkspaceItem,
  kind: WorkflowActionKind,
  priority: number
) {
  const meta = actionMeta(item, kind);

  candidates.push({
    id: `${kind}-${item.id}`,
    item,
    kind,
    priority,
    ...meta,
  });
}

function isRunningTarget(
  item: RoomWorkspaceItem,
  runningSession: WorkSession | null
): boolean {
  if (!runningSession) {
    return false;
  }

  return (
    runningSession.project_id === item.project_id &&
    runningSession.room_id === item.room_id &&
    runningSession.phase_id === item.phase_id
  );
}

export function buildPrioritizedWorkflowActions(input: {
  projectItems: ProjectWorkspaceItem[];
  roomItems: RoomWorkspaceItem[];
  runningSession: WorkSession | null;
  today: string;
  limit?: number;
}): WorkflowAction[] {
  const candidates: WorkflowAction[] = [];
  const limit = input.limit ?? 5;

  for (const item of input.projectItems) {
    if (item.status === "completed" || item.status === "blocked") {
      continue;
    }

    if (item.status === "in_progress") {
      pushAction(candidates, item, "current", PRIORITY.project_current);
      continue;
    }

    if (item.status === "not_started") {
      pushAction(candidates, item, "not_started", PRIORITY.project_new);
    }
  }

  for (const item of input.roomItems) {
    if (!item.is_current || item.status === "completed" || item.status === "blocked") {
      continue;
    }

    if (isRunningTarget(item, input.runningSession)) {
      continue;
    }

    if (item.status === "in_progress") {
      pushAction(candidates, item, "current", PRIORITY.room_current);
      continue;
    }

    if (item.status === "not_started") {
      pushAction(candidates, item, "not_started", PRIORITY.room_new);
    }
  }

  for (const item of [...input.projectItems, ...input.roomItems]) {
    if (
      item.status === "completed" ||
      !item.target_end_date ||
      item.target_end_date >= input.today
    ) {
      continue;
    }

    if (item.scope === "room" && isRunningTarget(item, input.runningSession)) {
      continue;
    }

    pushAction(candidates, item, "overdue", PRIORITY.overdue);
  }

  const seen = new Set<string>();

  return candidates
    .sort((left, right) => {
      if (left.priority !== right.priority) {
        return left.priority - right.priority;
      }

      return left.item.project_name.localeCompare(right.item.project_name, "bg");
    })
    .filter((action) => {
      const key = `${action.item.scope}:${action.item.id}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .slice(0, limit);
}
