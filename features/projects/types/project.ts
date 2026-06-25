import { bg } from "@/src/i18n/bg";

import { assertProjectType } from "@/features/projects/lib/normalize-project-type";

export const PROJECT_TYPES = [
  "residential",
  "commercial",
  "hospitality",
  "renovation",
  "staging",
] as const;

export const ENGAGEMENT_STATUSES = [
  "inquiry",
  "active",
  "paused",
  "completed",
  "archived",
] as const;

export const PROJECT_PRIORITIES = [
  "low",
  "normal",
  "high",
  "critical",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];
export type EngagementStatus = (typeof ENGAGEMENT_STATUSES)[number];
export type ProjectPriority = (typeof PROJECT_PRIORITIES)[number];

export interface Project {
  id: string;
  client_id: string;
  name: string;
  project_type: ProjectType;
  site_address: string | null;
  site_area: number | null;
  engagement_status: EngagementStatus;
  priority: ProjectPriority;
  target_handover_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProjectWithClient extends Project {
  client_display_name: string;
}

export interface ProjectRow {
  id: string;
  client_id: string;
  name: string;
  project_type: string;
  site_address: string | null;
  site_area: number | null;
  engagement_status: string;
  priority: string;
  target_handover_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  clients?: { display_name: string } | { display_name: string }[] | null;
}

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = bg.labels.projectType;

export const ENGAGEMENT_STATUS_LABELS: Record<EngagementStatus, string> =
  bg.labels.engagementStatus;

export const PROJECT_PRIORITY_LABELS: Record<ProjectPriority, string> =
  bg.labels.projectPriority;

export function isProjectType(value: string): value is ProjectType {
  return PROJECT_TYPES.includes(value as ProjectType);
}

/** Display-only Bulgarian labels for canonical English enum values. */
export function getProjectTypeLabel(projectType: ProjectType): string {
  return PROJECT_TYPE_LABELS[projectType];
}

export function isEngagementStatus(value: string): value is EngagementStatus {
  return ENGAGEMENT_STATUSES.includes(value as EngagementStatus);
}

export function isProjectPriority(value: string): value is ProjectPriority {
  return PROJECT_PRIORITIES.includes(value as ProjectPriority);
}

function resolveClientDisplayName(
  row: ProjectRow,
  clientId: string
): string {
  if (Array.isArray(row.clients)) {
    return row.clients[0]?.display_name ?? "Unknown Client";
  }

  if (row.clients?.display_name) {
    return row.clients.display_name;
  }

  return "Unknown Client";
}

export function mapProjectRow(row: ProjectRow): Project {
  const projectType = assertProjectType(row.project_type);
  const engagementStatusValue = row.engagement_status;

  if (!isEngagementStatus(engagementStatusValue)) {
    throw new Error(`Invalid engagement status: ${engagementStatusValue}`);
  }

  const priorityValue = row.priority;

  if (!isProjectPriority(priorityValue)) {
    throw new Error(`Invalid project priority: ${priorityValue}`);
  }

  if (!row.client_id) {
    throw new Error("Project is missing a client reference.");
  }

  return {
    id: row.id,
    client_id: row.client_id,
    name: row.name,
    project_type: projectType,
    site_address: row.site_address,
    site_area: row.site_area,
    engagement_status: engagementStatusValue,
    priority: priorityValue,
    target_handover_date: row.target_handover_date,
    created_at: row.created_at,
    updated_at: row.updated_at,
    deleted_at: row.deleted_at,
  };
}

export function mapProjectWithClientRow(row: ProjectRow): ProjectWithClient {
  const project = mapProjectRow(row);

  return {
    ...project,
    client_display_name: resolveClientDisplayName(row, project.client_id),
  };
}

export interface ProjectDetailRoomPhase {
  id: string;
  phase_kind: string;
  status: string;
  sort_order: number;
}

export interface ProjectDetailRoom {
  id: string;
  name: string;
  room_kind: string;
  scope_summary: string | null;
  priority: string;
  current_phase_id: string | null;
  sort_order: number;
  phases: ProjectDetailRoomPhase[];
}

export interface ProjectDetail extends ProjectWithClient {
  rooms: ProjectDetailRoom[];
}
