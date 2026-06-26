import type {
  WorkflowActionDisplay,
  WorkspaceItem,
} from "@/features/studio-workflow/types/workspace-item";
import { bg } from "@/src/i18n/bg";

export function adaptWorkspaceItemDisplay(
  item: WorkspaceItem
): WorkflowActionDisplay {
  if (item.scope === "project") {
    return {
      title: item.label,
      subtitle: bg.studioWorkflow.projectContext(item.project_name),
      scope: "project",
    };
  }

  return {
    title: item.room_name,
    subtitle: item.label,
    scope: "room",
  };
}
