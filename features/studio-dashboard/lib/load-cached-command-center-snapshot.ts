import "server-only";

import { unstable_cache } from "next/cache";

import {
  buildCommandCenterCacheableDerived,
  type BuildCommandCenterInput,
  type CommandCenterCacheableDerived,
} from "@/features/studio-dashboard/lib/build-command-center";
import {
  filterVisibleProjects,
  loadActiveWaitingEvents,
  loadProjectsWithClient,
  loadStudioProjectContext,
} from "@/features/studio-data/lib/load-studio-data";
import type { ProjectWithClient } from "@/features/projects/types/project";
import type { ProjectWorkspace } from "@/features/projects/types/project-workspace";
import type { ProjectWorkflowEngineView } from "@/features/workflow-engine/types/workflow-engine";
import type { WorkflowWaitingEvent } from "@/features/workflow-engine/types/workflow-waiting-event";
import {
  STUDIO_CACHE_REVALIDATE_SECONDS,
  STUDIO_CACHE_TAGS,
} from "@/lib/server/studio-cache";

export interface CachedCommandCenterSnapshot {
  visibleProjects: ProjectWithClient[];
  workspaces: ProjectWorkspace[];
  workflowEntries: [string, ProjectWorkflowEngineView][];
  activeWaitingEvents: WorkflowWaitingEvent[];
  derived: CommandCenterCacheableDerived;
}

async function buildCachedCommandCenterSnapshot(): Promise<CachedCommandCenterSnapshot> {
  const projects = await loadProjectsWithClient();
  const visibleProjects = filterVisibleProjects(projects);
  const visibleProjectIds = visibleProjects.map((project) => project.id);

  const [activeWaitingEvents, { workspaces, workflows }] = await Promise.all([
    loadActiveWaitingEvents(),
    loadStudioProjectContext({
      workspaceProjectIds: visibleProjectIds,
      workflowProjectIds: visibleProjectIds,
    }),
  ]);

  const buildInput: BuildCommandCenterInput = {
    projects: visibleProjects,
    workspaces,
    workflows,
    activeWaitingEvents,
    continueWorking: { kind: "empty" },
    pausedSessions: [],
    recentSessions: [],
  };

  return {
    visibleProjects,
    workspaces,
    workflowEntries: Array.from(workflows.entries()),
    activeWaitingEvents,
    derived: buildCommandCenterCacheableDerived(buildInput),
  };
}

export const loadCachedCommandCenterSnapshot = unstable_cache(
  buildCachedCommandCenterSnapshot,
  ["command-center-snapshot-v1"],
  {
    revalidate: STUDIO_CACHE_REVALIDATE_SECONDS,
    tags: [
      STUDIO_CACHE_TAGS.projects,
      STUDIO_CACHE_TAGS.waiting,
      STUDIO_CACHE_TAGS.capacity,
      STUDIO_CACHE_TAGS.health,
    ],
  }
);
