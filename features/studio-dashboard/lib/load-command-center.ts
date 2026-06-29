import "server-only";

import { cache } from "react";

import { collectPausedWorkflowSessions } from "@/features/planning-engine/lib/collect-paused-workflow-sessions";
import {
  filterActiveProjects,
} from "@/features/studio-data/lib/load-studio-data";
import { loadCachedCommandCenterSnapshot } from "@/features/studio-dashboard/lib/load-cached-command-center-snapshot";
import {
  buildCommandCenterCritical,
  resolveCommandCenterPlanning,
  type BuildCommandCenterInput,
  type CommandCenterCacheableDerived,
  type ResolvedCommandCenterPlanning,
} from "@/features/studio-dashboard/lib/build-command-center";
import type {
  CommandCenterBackgroundView,
  CommandCenterCriticalView,
} from "@/features/studio-dashboard/types/command-center-view";
import { buildStudioWeeklyTimelineCached } from "@/lib/server/memo-builders";
import type { StudioWeeklyTimelineView } from "@/features/studio-dashboard/types/studio-weekly-timeline-view";
import { getWorkSessionService } from "@/features/work-sessions/service/get-work-session-service";

interface CommandCenterLoadedContext {
  buildInput: BuildCommandCenterInput;
  visibleProjects: BuildCommandCenterInput["projects"];
  planning: ResolvedCommandCenterPlanning;
  cachedDerived: CommandCenterCacheableDerived;
}

const loadContinueWorkingFresh = cache(async () => {
  const workSessionService = await getWorkSessionService();
  return workSessionService.getContinueWorking();
});

const loadCommandCenterContext = cache(async (): Promise<CommandCenterLoadedContext> => {
  const [snapshot, continueWorking] = await Promise.all([
    loadCachedCommandCenterSnapshot(),
    loadContinueWorkingFresh(),
  ]);

  const workflows = new Map(snapshot.workflowEntries);
  const activeProjects = filterActiveProjects(snapshot.visibleProjects);

  const pausedSessions = await collectPausedWorkflowSessions({
    projects: activeProjects,
    workflows,
  });

  const buildInput: BuildCommandCenterInput = {
    projects: snapshot.visibleProjects,
    workspaces: snapshot.workspaces,
    workflows,
    activeWaitingEvents: snapshot.activeWaitingEvents,
    continueWorking,
    pausedSessions,
    recentSessions: [],
  };

  return {
    visibleProjects: snapshot.visibleProjects,
    buildInput,
    planning: resolveCommandCenterPlanning(buildInput),
    cachedDerived: snapshot.derived,
  };
});

export const loadCommandCenterCritical = cache(async (): Promise<CommandCenterCriticalView> => {
  const { buildInput, planning, cachedDerived } = await loadCommandCenterContext();
  return buildCommandCenterCritical(buildInput, planning, cachedDerived);
});

export interface CommandCenterBackgroundPayload {
  background: CommandCenterBackgroundView;
  studioTimeline: StudioWeeklyTimelineView;
}

async function loadCommandCenterBackgroundPayload(): Promise<CommandCenterBackgroundPayload> {
  const { buildInput, visibleProjects, cachedDerived } = await loadCommandCenterContext();

  const studioTimeline = buildStudioWeeklyTimelineCached({
    projects: visibleProjects,
    workflows: buildInput.workflows,
    waitingEvents: buildInput.activeWaitingEvents,
    capacity: cachedDerived.background.capacity,
  });

  return {
    background: cachedDerived.background,
    studioTimeline,
  };
}

export const getCommandCenterBackground = cache(loadCommandCenterBackgroundPayload);
