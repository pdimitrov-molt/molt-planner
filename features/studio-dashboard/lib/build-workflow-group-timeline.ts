import type { StudioTimelineStep } from "@/features/studio-dashboard/types/studio-dashboard-view";
import type { ProjectWorkflowEngineView } from "@/features/workflow-engine/types/workflow-engine";

function mapGroupToTimelineState(
  group: ProjectWorkflowEngineView["groups"][number]
): StudioTimelineStep["state"] {
  if (group.status === "completed" || group.progress_percent >= 100) {
    return "completed";
  }

  if (group.is_current || group.status === "in_progress") {
    return "current";
  }

  return "future";
}

export function buildWorkflowGroupTimeline(
  workflow: ProjectWorkflowEngineView | null
): StudioTimelineStep[] {
  if (!workflow) {
    return [];
  }

  return workflow.groups
    .filter((group) => group.enabled)
    .map((group) => ({
      id: group.id,
      label: group.name,
      state: mapGroupToTimelineState(group),
    }));
}
