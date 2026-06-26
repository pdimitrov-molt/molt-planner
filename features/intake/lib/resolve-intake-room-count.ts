import type { IntakeScopeInput } from "@/features/intake/types/intake-plan";
import type { ProjectCategory } from "@/features/projects/types/project";
import { getRoomTemplateSet } from "@/features/rooms/data/room-templates";

export function resolveIntakeRoomCount(
  category: ProjectCategory,
  scope: IntakeScopeInput
): number {
  if (scope.mode === "manual") {
    return Math.max(1, Math.round(scope.approximate_room_count));
  }

  const templateSet = getRoomTemplateSet(category);

  if (!templateSet) {
    return Math.max(1, Math.round(scope.approximate_room_count));
  }

  if (scope.selected_template_room_keys.length === 0) {
    return templateSet.rooms.length;
  }

  return scope.selected_template_room_keys.length;
}
