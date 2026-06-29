import type { ProjectWithClient } from "@/features/projects/types/project";
import type { Room } from "@/features/rooms/types/room";
import type { ProjectSettingsExtras } from "@/features/project-settings/types/project-settings-extras";
import type { WorkflowGroupDefinition } from "@/features/workflow-engine/types/workflow-engine";
import type { WorkflowType } from "@/features/project-settings/types/workflow-type";

export interface ProjectSettingsView {
  project: ProjectWithClient;
  workflow_type: WorkflowType;
  estimated_design_hours: number | null;
  estimated_execution_hours: number | null;
  workflow_groups: WorkflowGroupDefinition[];
  rooms: Room[];
  settings_extras: ProjectSettingsExtras;
}

export interface ProjectSettingsRecord {
  project: ProjectWithClient;
  workflow_type: WorkflowType;
  estimated_design_hours: number | null;
  estimated_execution_hours: number | null;
  workflow_definition: unknown;
  settings_extras: ProjectSettingsExtras;
}
