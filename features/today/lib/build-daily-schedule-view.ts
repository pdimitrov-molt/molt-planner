import { format, parseISO } from "date-fns";

import type { ProjectWorkspace } from "@/features/projects/types/project-workspace";
import type { PersonalItem } from "@/features/personal-items/types/personal-item";
import { getWaitingReasonLabel } from "@/features/workflow-engine/lib/waiting-reason-labels";
import type { ProjectWorkflowEngineView } from "@/features/workflow-engine/types/workflow-engine";
import type { WorkflowWaitingEvent } from "@/features/workflow-engine/types/workflow-waiting-event";
import type {
  DailyScheduleItem,
  DailyScheduleItemKind,
  DailyScheduleSummary,
  DailyScheduleView,
} from "@/features/today/types/daily-schedule-view";
import { bg } from "@/src/i18n/bg";
import { bgLocale } from "@/src/i18n/format";

const TIME_PATTERN = /\b([01]?\d|2[0-3]):([0-5]\d)\b/;

interface BuildDailyScheduleViewInput {
  workspaces: ProjectWorkspace[];
  personalItems: PersonalItem[];
  activeWaitingEvents: WorkflowWaitingEvent[];
  workflows: Map<string, ProjectWorkflowEngineView>;
  userName?: string;
  referenceDate?: Date;
}

function todayIso(referenceDate: Date): string {
  return referenceDate.toISOString().slice(0, 10);
}

function buildProjectHref(projectId: string): string {
  return `/projects/${projectId}`;
}

function extractTimeFromText(
  ...values: Array<string | null | undefined>
): { sort_minutes: number; time_label: string } | null {
  for (const value of values) {
    if (!value) {
      continue;
    }

    const match = value.match(TIME_PATTERN);

    if (!match) {
      continue;
    }

    const hours = Number.parseInt(match[1], 10);
    const minutes = Number.parseInt(match[2], 10);

    return {
      sort_minutes: hours * 60 + minutes,
      time_label: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
    };
  }

  return null;
}

function extractTimeFromTimestamp(
  timestamp: string | null,
  today: string
): { sort_minutes: number; time_label: string } | null {
  if (!timestamp) {
    return null;
  }

  const parsed = parseISO(timestamp);
  const datePart = timestamp.slice(0, 10);

  if (datePart !== today) {
    return null;
  }

  const hours = parsed.getHours();
  const minutes = parsed.getMinutes();

  return {
    sort_minutes: hours * 60 + minutes,
    time_label: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
  };
}

function resolveScheduleTime(input: {
  today: string;
  title: string;
  description?: string | null;
  expected_at?: string | null;
  started_at?: string | null;
}): { sort_minutes: number | null; time_label: string | null } {
  const fromExpected = extractTimeFromTimestamp(input.expected_at ?? null, input.today);

  if (fromExpected) {
    return fromExpected;
  }

  const fromText = extractTimeFromText(input.title, input.description);

  if (fromText) {
    return fromText;
  }

  const fromStarted = extractTimeFromTimestamp(input.started_at ?? null, input.today);

  if (fromStarted) {
    return fromStarted;
  }

  return {
    sort_minutes: null,
    time_label: null,
  };
}

function isPersonalItemDueToday(item: PersonalItem, today: string): boolean {
  if (item.status === "DONE" || item.status === "CANCELLED") {
    return false;
  }

  if (!item.due_date) {
    return false;
  }

  return item.due_date <= today;
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

function sortTimedItems(items: DailyScheduleItem[]): DailyScheduleItem[] {
  return [...items].sort((left, right) => {
    if (left.sort_minutes !== right.sort_minutes) {
      return (left.sort_minutes ?? 0) - (right.sort_minutes ?? 0);
    }

    return left.title.localeCompare(right.title, "bg");
  });
}

function sortUntimedItems(items: DailyScheduleItem[]): DailyScheduleItem[] {
  const kindOrder: DailyScheduleItemKind[] = [
    "project",
    "personal",
    "meeting",
    "reminder",
    "waiting",
  ];

  return [...items].sort((left, right) => {
    const leftKind = kindOrder.indexOf(left.kind);
    const rightKind = kindOrder.indexOf(right.kind);

    if (leftKind !== rightKind) {
      return leftKind - rightKind;
    }

    return left.title.localeCompare(right.title, "bg");
  });
}

function buildProjectItems(workspaces: ProjectWorkspace[], today: string): DailyScheduleItem[] {
  return workspaces.flatMap((workspace) =>
    workspace.today_tasks
      .filter((task) => task.status !== "done")
      .map((task) => {
        const scheduleTime = resolveScheduleTime({
          today,
          title: task.title,
        });

        return {
          id: `project:${task.id}`,
          kind: "project" as const,
          title: task.title,
          subtitle: `${workspace.name} · ${task.room_name} · ${task.phase_label}`,
          time_label: scheduleTime.time_label,
          sort_minutes: scheduleTime.sort_minutes,
          href: buildProjectHref(workspace.id),
          project_id: workspace.id,
        };
      })
  );
}

function buildPersonalItems(
  personalItems: PersonalItem[],
  today: string,
  kind: "personal" | "meeting" | "reminder"
): DailyScheduleItem[] {
  const category =
    kind === "meeting" ? "meeting" : kind === "reminder" ? "reminder" : null;

  return personalItems
    .filter((item) => {
      if (!isPersonalItemDueToday(item, today)) {
        return false;
      }

      if (kind === "personal") {
        return item.category !== "meeting" && item.category !== "reminder";
      }

      return item.category === category;
    })
    .map((item) => {
      const scheduleTime = resolveScheduleTime({
        today,
        title: item.title,
        description: item.description,
      });

      return {
        id: `${kind}:${item.id}`,
        kind,
        title: item.title,
        subtitle: bg.personalItems.category[item.category],
        time_label: scheduleTime.time_label,
        sort_minutes: scheduleTime.sort_minutes,
        href: "/personal",
        project_id: null,
      };
    });
}

function buildWaitingItems(input: {
  activeWaitingEvents: WorkflowWaitingEvent[];
  workflows: Map<string, ProjectWorkflowEngineView>;
  projectsById: Map<string, { name: string }>;
  today: string;
}): DailyScheduleItem[] {
  const items: DailyScheduleItem[] = [];

  for (const event of input.activeWaitingEvents) {
    const project = input.projectsById.get(event.project_id);

    if (!project) {
      continue;
    }

    const workflow = input.workflows.get(event.project_id) ?? null;
    const stageName = resolveWaitingStageName(event, workflow);
    const reasonLabel = getWaitingReasonLabel(event.reason, event.custom_reason);
    const scheduleTime = resolveScheduleTime({
      today: input.today,
      title: stageName,
      description: event.notes,
      expected_at: event.expected_end_at,
      started_at: event.started_at,
    });

    items.push({
      id: `waiting:${event.id}`,
      kind: "waiting",
      title: stageName,
      subtitle: `${project.name} · ${reasonLabel}`,
      time_label: scheduleTime.time_label,
      sort_minutes: scheduleTime.sort_minutes,
      href: buildProjectHref(event.project_id),
      project_id: event.project_id,
    });
  }

  return items;
}

function buildSummary(items: DailyScheduleItem[]): DailyScheduleSummary {
  return {
    project_tasks: items.filter((item) => item.kind === "project").length,
    personal_tasks: items.filter((item) => item.kind === "personal").length,
    meetings: items.filter((item) => item.kind === "meeting").length,
    waiting: items.filter((item) => item.kind === "waiting").length,
  };
}

function partitionItems(items: DailyScheduleItem[]): {
  timed_items: DailyScheduleItem[];
  untimed_items: DailyScheduleItem[];
} {
  const timed_items: DailyScheduleItem[] = [];
  const untimed_items: DailyScheduleItem[] = [];

  for (const item of items) {
    if (item.sort_minutes !== null) {
      timed_items.push(item);
    } else {
      untimed_items.push(item);
    }
  }

  return {
    timed_items: sortTimedItems(timed_items),
    untimed_items: sortUntimedItems(untimed_items),
  };
}

export function buildDailyScheduleView(
  input: BuildDailyScheduleViewInput
): DailyScheduleView {
  const referenceDate = input.referenceDate ?? new Date();
  const today = todayIso(referenceDate);
  const projectsById = new Map(
    input.workspaces.map((workspace) => [workspace.id, { name: workspace.name }])
  );

  const items: DailyScheduleItem[] = [
    ...buildProjectItems(input.workspaces, today),
    ...buildPersonalItems(input.personalItems, today, "personal"),
    ...buildPersonalItems(input.personalItems, today, "meeting"),
    ...buildPersonalItems(input.personalItems, today, "reminder"),
    ...buildWaitingItems({
      activeWaitingEvents: input.activeWaitingEvents,
      workflows: input.workflows,
      projectsById,
      today,
    }),
  ];

  const { timed_items, untimed_items } = partitionItems(items);

  return {
    date_label: format(referenceDate, "EEEE, d MMMM yyyy", { locale: bgLocale }),
    user_name: input.userName ?? bg.dailySchedule.defaultUserName,
    summary: buildSummary(items),
    timed_items,
    untimed_items,
  };
}
