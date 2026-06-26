import { bg } from "@/src/i18n/bg";

export const PROJECT_CATEGORIES = ["residential", "commercial"] as const;

export const PROJECT_OBJECT_TYPES = [
  "apartment",
  "house",
  "penthouse",
  "studio",
  "office",
  "restaurant",
  "hotel",
  "clinic",
  "fitness",
  "retail",
  "beauty_salon",
  "cafe",
  "bar",
  "villa",
  "holiday_apartment",
  "other",
] as const;

export const PROJECT_PACKAGES = [
  "interior",
  "exterior",
  "interior_exterior",
  "author_supervision",
  "complete_package",
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

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];
export type ProjectObjectType = (typeof PROJECT_OBJECT_TYPES)[number];
export type ProjectPackage = (typeof PROJECT_PACKAGES)[number];
export type EngagementStatus = (typeof ENGAGEMENT_STATUSES)[number];
export type ProjectPriority = (typeof PROJECT_PRIORITIES)[number];

export interface Project {
  id: string;
  client_id: string;
  project_number: string;
  name: string;
  category: ProjectCategory;
  object_type: ProjectObjectType;
  package: ProjectPackage;
  site_address: string | null;
  site_area: number | null;
  engagement_status: EngagementStatus;
  priority: ProjectPriority;
  design_deadline: string | null;
  execution_deadline: string | null;
  move_in_date: string | null;
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
  project_number: string | null;
  name: string;
  category: string | null;
  object_type: string | null;
  package: string | null;
  site_address: string | null;
  site_area: number | null;
  engagement_status: string;
  priority: string;
  design_deadline: string | null;
  execution_deadline: string | null;
  move_in_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  clients?: { display_name: string } | { display_name: string }[] | null;
}

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> =
  bg.labels.projectCategory;
export const PROJECT_OBJECT_TYPE_LABELS: Record<ProjectObjectType, string> =
  bg.labels.projectObjectType;
export const PROJECT_PACKAGE_LABELS: Record<ProjectPackage, string> =
  bg.labels.projectPackage;

export const ENGAGEMENT_STATUS_LABELS: Record<EngagementStatus, string> =
  bg.labels.engagementStatus;

export const PROJECT_PRIORITY_LABELS: Record<ProjectPriority, string> =
  bg.labels.projectPriority;

export const DEFAULT_PROJECT_PACKAGE: ProjectPackage = "interior";

export function isProjectCategory(value: string): value is ProjectCategory {
  return PROJECT_CATEGORIES.includes(value as ProjectCategory);
}

export function isProjectObjectType(value: string): value is ProjectObjectType {
  return PROJECT_OBJECT_TYPES.includes(value as ProjectObjectType);
}

export function isProjectPackage(value: string): value is ProjectPackage {
  return PROJECT_PACKAGES.includes(value as ProjectPackage);
}

export function getDefaultObjectTypeForCategory(
  category: ProjectCategory
): ProjectObjectType {
  return category === "commercial" ? "office" : "apartment";
}

export function getProjectCategoryLabel(category: ProjectCategory): string {
  return PROJECT_CATEGORY_LABELS[category];
}

export function getProjectObjectTypeLabel(objectType: ProjectObjectType): string {
  return PROJECT_OBJECT_TYPE_LABELS[objectType];
}

export function getProjectPackageLabel(projectPackage: ProjectPackage): string {
  return PROJECT_PACKAGE_LABELS[projectPackage];
}

export function getProjectClassificationLabel(project: Pick<
  Project,
  "category" | "object_type" | "package"
>): string {
  return `${getProjectCategoryLabel(project.category)} · ${getProjectObjectTypeLabel(project.object_type)} · ${getProjectPackageLabel(project.package)}`;
}

export function resolveProjectClassification(input: {
  category: ProjectCategory;
  object_type?: ProjectObjectType;
  package?: ProjectPackage;
}): Pick<Project, "category" | "object_type" | "package"> {
  return {
    category: input.category,
    object_type: input.object_type ?? getDefaultObjectTypeForCategory(input.category),
    package: input.package ?? DEFAULT_PROJECT_PACKAGE,
  };
}

export function isEngagementStatus(value: string): value is EngagementStatus {
  return ENGAGEMENT_STATUSES.includes(value as EngagementStatus);
}

export function isProjectPriority(value: string): value is ProjectPriority {
  return PROJECT_PRIORITIES.includes(value as ProjectPriority);
}

function resolveClientDisplayName(row: ProjectRow): string {
  if (Array.isArray(row.clients)) {
    return row.clients[0]?.display_name ?? "Unknown Client";
  }

  if (row.clients?.display_name) {
    return row.clients.display_name;
  }

  return "Unknown Client";
}

function resolveCategory(row: ProjectRow): ProjectCategory {
  if (row.category && isProjectCategory(row.category)) {
    return row.category;
  }

  return "residential";
}

function resolveObjectType(row: ProjectRow, category: ProjectCategory): ProjectObjectType {
  if (row.object_type && isProjectObjectType(row.object_type)) {
    return row.object_type;
  }

  return getDefaultObjectTypeForCategory(category);
}

function resolvePackage(row: ProjectRow): ProjectPackage {
  if (row.package && isProjectPackage(row.package)) {
    return row.package;
  }

  return DEFAULT_PROJECT_PACKAGE;
}

export function mapProjectRow(row: ProjectRow): Project {
  const category = resolveCategory(row);
  const objectType = resolveObjectType(row, category);
  const projectPackage = resolvePackage(row);
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

  const projectNumber =
    row.project_number?.trim() ||
    `P${row.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;

  return {
    id: row.id,
    client_id: row.client_id,
    project_number: projectNumber,
    name: row.name,
    category,
    object_type: objectType,
    package: projectPackage,
    site_address: row.site_address,
    site_area: row.site_area,
    engagement_status: engagementStatusValue,
    priority: priorityValue,
    design_deadline: row.design_deadline,
    execution_deadline: row.execution_deadline,
    move_in_date: row.move_in_date,
    created_at: row.created_at,
    updated_at: row.updated_at,
    deleted_at: row.deleted_at,
  };
}

export function mapProjectWithClientRow(row: ProjectRow): ProjectWithClient {
  const project = mapProjectRow(row);

  return {
    ...project,
    client_display_name: resolveClientDisplayName(row),
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
