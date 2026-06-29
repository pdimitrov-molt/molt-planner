import { cache } from "react";

import { buildInboxView } from "@/features/inbox/lib/build-inbox-view";
import { buildCommandCenter } from "@/features/studio-dashboard/lib/build-command-center";
import { buildStudioWeeklyTimeline } from "@/features/studio-dashboard/lib/build-studio-weekly-timeline";
import { buildWorkflowGroupTimeline } from "@/features/studio-dashboard/lib/build-workflow-group-timeline";
import { buildDailyScheduleView } from "@/features/today/lib/build-daily-schedule-view";
import type { ProjectWorkflowEngineView } from "@/features/workflow-engine/types/workflow-engine";

export const buildCommandCenterCached = cache(buildCommandCenter);

export const buildInboxViewCached = cache(buildInboxView);

export const buildDailyScheduleViewCached = cache(buildDailyScheduleView);

export const buildStudioWeeklyTimelineCached = cache(buildStudioWeeklyTimeline);

export const buildWorkflowGroupTimelineCached = cache(
  (_projectId: string, workflow: ProjectWorkflowEngineView | null) =>
    buildWorkflowGroupTimeline(workflow)
);
