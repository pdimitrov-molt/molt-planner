import type { PhaseStatus } from "@/features/phases/types/phase";
import type { ProjectWorkspace } from "@/features/projects/types/project-workspace";
import {
  getProjectObjectTypeLabel,
  type ProjectWithClient,
} from "@/features/projects/types/project";
import { buildProjectTimeline } from "@/features/studio-dashboard/lib/build-project-timeline";
import type {
  StudioDashboardView,
  StudioProjectRow,
  StudioProjectStatus,
  StudioRoomRow,
  StudioSummaryCard,
} from "@/features/studio-dashboard/types/studio-dashboard-view";
import { buildMockProjectWorkspaceItems } from "@/features/studio-workflow/lib/build-mock-project-workspace-items";
import type { ProjectWorkspaceItem } from "@/features/studio-workflow/types/workspace-item";
import { bg } from "@/src/i18n/bg";
import { formatArea } from "@/src/i18n/format";

interface BuildStudioDashboardInput {
  projects: ProjectWithClient[];
  workspaces: ProjectWorkspace[];
  referenceDate?: Date;
}

function todayIso(referenceDate: Date): string {
  return referenceDate.toISOString().slice(0, 10);
}

function formatRemainingHours(hours: number): string {
  if (hours <= 0) {
    return bg.studioDashboard.roomTable.noRemainingHours;
  }

  return bg.studioDashboard.roomTable.remainingHours(hours);
}

function getRoomCurrentTask(
  workspace: ProjectWorkspace,
  roomName: string,
  fallback: string
): string {
  const task = workspace.today_tasks.find((entry) => entry.room_name === roomName);

  return task?.title ?? fallback;
}

function buildRoomRows(
  workspace: ProjectWorkspace | null,
  projectId: string
): StudioRoomRow[] {
  if (!workspace) {
    return [];
  }

  return workspace.rooms.map((room) => ({
    id: room.id,
    name: room.name,
    current_phase_label: room.current_phase_label,
    current_task_label: getRoomCurrentTask(
      workspace,
      room.name,
      bg.studioDashboard.roomTable.noCurrentTask
    ),
    status_label: room.status_label,
    status: room.current_phase_status,
    remaining_hours_label: formatRemainingHours(room.remaining_hours),
    progress_percent: room.progress_percent,
    href: `/projects/${projectId}/rooms/${room.id}`,
  }));
}

function projectHasOverduePhases(
  workspace: ProjectWorkspace | null,
  projectItems: ProjectWorkspaceItem[],
  today: string
): boolean {
  if (
    projectItems.some(
      (item) =>
        item.target_end_date &&
        item.target_end_date < today &&
        item.status !== "completed"
    )
  ) {
    return true;
  }

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

function projectHasWaiting(
  workspace: ProjectWorkspace | null,
  projectItems: ProjectWorkspaceItem[]
): boolean {
  if (projectItems.some((item) => item.status === "blocked")) {
    return true;
  }

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
  projectItems: ProjectWorkspaceItem[]
): boolean {
  if (projectItems.some((item) => item.status === "in_progress")) {
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
  projectItems: ProjectWorkspaceItem[];
  today: string;
}): StudioProjectStatus {
  if (
    input.project.engagement_status === "completed" ||
    input.workspace?.is_completed
  ) {
    return "completed";
  }

  if (projectHasOverduePhases(input.workspace, input.projectItems, input.today)) {
    return "overdue";
  }

  if (projectHasWaiting(input.workspace, input.projectItems)) {
    return "waiting";
  }

  if (projectHasInProgress(input.workspace, input.projectItems)) {
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

function findTimelineProjectItem(
  projectItems: ProjectWorkspaceItem[]
): ProjectWorkspaceItem | null {
  const research = projectItems.find((item) => item.kind === "research");

  if (research) {
    return research;
  }

  return (
    projectItems.find((item) => item.status === "in_progress") ??
    projectItems.find((item) => item.status !== "completed") ??
    null
  );
}

function buildProjectRow(input: {
  project: ProjectWithClient;
  workspace: ProjectWorkspace | null;
  projectItems: ProjectWorkspaceItem[];
  today: string;
}): StudioProjectRow {
  const status = resolveProjectStatus(input);
  const timelineProjectItem = findTimelineProjectItem(input.projectItems);

  return {
    id: input.project.id,
    name: input.project.name,
    project_number: input.project.project_number,
    object_type_label: getProjectObjectTypeLabel(input.project.object_type),
    area_label: input.workspace?.site_area_label ?? formatAreaLabel(input.project.site_area),
    engagement_status: input.project.engagement_status,
    status,
    status_label: STATUS_LABELS[status],
    progress_percent:
      input.workspace?.overall_completion_percent ??
      (status === "completed" ? 100 : 0),
    timeline: buildProjectTimeline({
      workspace: input.workspace,
      projectItem: timelineProjectItem,
      today: input.today,
    }),
    rooms: buildRoomRows(input.workspace, input.project.id),
    href: `/projects/${input.project.id}`,
  };
}

function formatAreaLabel(area: number | null): string {
  if (area === null) {
    return bg.common.areaNotSet;
  }

  return formatArea(area);
}

function buildSummary(projects: StudioProjectRow[]): StudioSummaryCard[] {
  const total = projects.length;
  const active = projects.filter(
    (project) => project.engagement_status === "active"
  ).length;

  return [
    {
      id: "active",
      value: active,
      total,
      accent: "green",
    },
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

export function buildStudioDashboard(
  input: BuildStudioDashboardInput
): StudioDashboardView {
  const referenceDate = input.referenceDate ?? new Date();
  const today = todayIso(referenceDate);
  const workspaceById = new Map(
    input.workspaces.map((workspace) => [workspace.id, workspace])
  );
  const mockItemsByProject = new Map<string, ProjectWorkspaceItem[]>();

  for (const item of buildMockProjectWorkspaceItems(input.projects, referenceDate)) {
    const items = mockItemsByProject.get(item.project_id) ?? [];
    items.push(item);
    mockItemsByProject.set(item.project_id, items);
  }

  const projects = sortProjects(
    input.projects.map((project) =>
      buildProjectRow({
        project,
        workspace: workspaceById.get(project.id) ?? null,
        projectItems: mockItemsByProject.get(project.id) ?? [],
        today,
      })
    )
  );

  return {
    summary: buildSummary(projects),
    projects,
  };
}
