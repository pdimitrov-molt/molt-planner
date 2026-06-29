import type { WorkflowDocumentItemDefinition } from "@/features/workflow-engine/types/workflow-engine";

export interface ProjectTeamSettings {
  designer: string;
  visualizer: string;
  technical_designer: string;
  project_manager: string;
}

export interface ProjectFileEntry {
  id: string;
  name: string;
  note: string | null;
  url: string | null;
  created_at: string;
}

export interface ProjectSettingsExtras {
  team: ProjectTeamSettings;
  document_templates: WorkflowDocumentItemDefinition[];
  files: ProjectFileEntry[];
}

export const EMPTY_TEAM_SETTINGS: ProjectTeamSettings = {
  designer: "",
  visualizer: "",
  technical_designer: "",
  project_manager: "",
};
