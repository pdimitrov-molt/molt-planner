import "server-only";

import { unstable_cache } from "next/cache";

import type { ProjectWithClient } from "@/features/projects/types/project";
import { getProjectService } from "@/features/projects/service/get-project-service";
import {
  getProjectWorkspace,
  loadProjectWorkspaces,
} from "@/features/projects/service/project-workspace.service";
import { loadProjectWorkflowMap } from "@/features/workflow-engine/service/get-workflow-engine";
import { getWorkflowWaitingRepository } from "@/features/workflow-engine/service/get-workflow-waiting-service";
import type { ProjectWorkspace } from "@/features/projects/types/project-workspace";
import type { ProjectWorkflowEngineView } from "@/features/workflow-engine/types/workflow-engine";
import type { WorkflowWaitingEvent } from "@/features/workflow-engine/types/workflow-waiting-event";
import {
  STUDIO_CACHE_REVALIDATE_SECONDS,
  STUDIO_CACHE_TAGS,
} from "@/lib/server/studio-cache";
import { cache } from "react";

async function fetchProjectsWithClient(): Promise<ProjectWithClient[]> {
  const service = await getProjectService();
  return service.listProjectsWithClient();
}

async function fetchActiveWaitingEvents(): Promise<WorkflowWaitingEvent[]> {
  const repository = await getWorkflowWaitingRepository();
  return repository.findAllActive();
}

const loadProjectsWithClientTtl = unstable_cache(
  fetchProjectsWithClient,
  ["studio-projects-list"],
  {
    revalidate: STUDIO_CACHE_REVALIDATE_SECONDS,
    tags: [STUDIO_CACHE_TAGS.projects],
  }
);

const loadActiveWaitingEventsTtl = unstable_cache(
  fetchActiveWaitingEvents,
  ["studio-waiting-events"],
  {
    revalidate: STUDIO_CACHE_REVALIDATE_SECONDS,
    tags: [STUDIO_CACHE_TAGS.waiting],
  }
);

export const loadProjectsWithClient = cache(async (): Promise<ProjectWithClient[]> => {
  return loadProjectsWithClientTtl();
});

export function filterVisibleProjects(projects: ProjectWithClient[]): ProjectWithClient[] {
  return projects.filter((project) => project.engagement_status !== "archived");
}

export function filterActiveProjects(projects: ProjectWithClient[]): ProjectWithClient[] {
  return projects.filter((project) => project.engagement_status === "active");
}

export { getProjectWorkspace, loadProjectWorkspaces, loadProjectWorkflowMap };

export const loadActiveWaitingEvents = cache(async (): Promise<WorkflowWaitingEvent[]> => {
  return loadActiveWaitingEventsTtl();
});

interface CachedStudioProjectContext {
  workspaces: ProjectWorkspace[];
  workflowEntries: [string, ProjectWorkflowEngineView][];
}

async function fetchStudioProjectContext(input: {
  workspaceProjectIds: readonly string[];
  workflowProjectIds: readonly string[];
}): Promise<CachedStudioProjectContext> {
  const [workspaces, workflows] = await Promise.all([
    loadProjectWorkspaces(input.workspaceProjectIds),
    loadProjectWorkflowMap(input.workflowProjectIds),
  ]);

  return {
    workspaces,
    workflowEntries: Array.from(workflows.entries()),
  };
}

function buildStudioProjectContextCacheKey(ids: readonly string[]): string {
  if (ids.length === 0) {
    return "_none_";
  }

  return [...ids].sort().join(",");
}

export async function loadStudioProjectContext(input: {
  workspaceProjectIds: readonly string[];
  workflowProjectIds: readonly string[];
}): Promise<{
  workspaces: ProjectWorkspace[];
  workflows: Map<string, ProjectWorkflowEngineView>;
}> {
  const workspaceKey = buildStudioProjectContextCacheKey(input.workspaceProjectIds);
  const workflowKey = buildStudioProjectContextCacheKey(input.workflowProjectIds);

  const cached = await unstable_cache(
    () => fetchStudioProjectContext(input),
    ["studio-project-context", workspaceKey, workflowKey],
    {
      revalidate: STUDIO_CACHE_REVALIDATE_SECONDS,
      tags: [STUDIO_CACHE_TAGS.projects],
    }
  )();

  return {
    workspaces: cached.workspaces,
    workflows: new Map(cached.workflowEntries),
  };
}
