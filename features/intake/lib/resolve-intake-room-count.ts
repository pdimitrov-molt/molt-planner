import type { IntakeScopeInput } from "@/features/intake/types/intake-plan";
import { getRoomTemplateSet } from "@/features/rooms/data/room-templates";
import type { ProjectType } from "@/features/projects/types/project";

export function resolveIntakeRoomCount(
  projectType: ProjectType,
  scope: IntakeScopeInput
): number {
  if (scope.mode === "manual") {
    return Math.max(1, Math.round(scope.approximate_room_count));
  }

  const templateSet = getRoomTemplateSet(projectType);

  if (!templateSet) {
    return Math.max(1, Math.round(scope.approximate_room_count));
  }

  if (scope.selected_template_room_keys.length === 0) {
    return templateSet.rooms.length;
  }

  return scope.selected_template_room_keys.length;
}
