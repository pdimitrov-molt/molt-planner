import { buildDefaultProjectDocumentTemplates } from "@/features/project-settings/lib/default-project-document-templates";
import {
  EMPTY_TEAM_SETTINGS,
  type ProjectFileEntry,
  type ProjectSettingsExtras,
  type ProjectTeamSettings,
} from "@/features/project-settings/types/project-settings-extras";
import type { WorkflowDocumentItemDefinition } from "@/features/workflow-engine/types/workflow-engine";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseTeam(value: unknown): ProjectTeamSettings {
  if (!isRecord(value)) {
    return { ...EMPTY_TEAM_SETTINGS };
  }

  return {
    designer: typeof value.designer === "string" ? value.designer : "",
    visualizer: typeof value.visualizer === "string" ? value.visualizer : "",
    technical_designer:
      typeof value.technical_designer === "string" ? value.technical_designer : "",
    project_manager:
      typeof value.project_manager === "string" ? value.project_manager : "",
  };
}

function parseDocumentTemplates(value: unknown): WorkflowDocumentItemDefinition[] {
  if (!Array.isArray(value) || value.length === 0) {
    return buildDefaultProjectDocumentTemplates();
  }

  const parsed = value
    .map((entry, index) => {
      if (!isRecord(entry)) {
        return null;
      }

      if (typeof entry.id !== "string" || typeof entry.key !== "string") {
        return null;
      }

      return {
        id: entry.id,
        key: entry.key,
        name: typeof entry.name === "string" ? entry.name : entry.key,
        sort_order:
          typeof entry.sort_order === "number" ? entry.sort_order : index,
        enabled: entry.enabled !== false,
      } satisfies WorkflowDocumentItemDefinition;
    })
    .filter((entry): entry is WorkflowDocumentItemDefinition => entry !== null);

  return parsed.length > 0 ? parsed : buildDefaultProjectDocumentTemplates();
}

function parseFiles(value: unknown): ProjectFileEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!isRecord(entry) || typeof entry.id !== "string") {
        return null;
      }

      return {
        id: entry.id,
        name: typeof entry.name === "string" ? entry.name : "File",
        note: typeof entry.note === "string" ? entry.note : null,
        url: typeof entry.url === "string" ? entry.url : null,
        created_at:
          typeof entry.created_at === "string"
            ? entry.created_at
            : new Date().toISOString(),
      } satisfies ProjectFileEntry;
    })
    .filter((entry): entry is ProjectFileEntry => entry !== null);
}

export function parseProjectSettingsExtras(value: unknown): ProjectSettingsExtras {
  if (!isRecord(value)) {
    return {
      team: { ...EMPTY_TEAM_SETTINGS },
      document_templates: buildDefaultProjectDocumentTemplates(),
      files: [],
    };
  }

  return {
    team: parseTeam(value.team),
    document_templates: parseDocumentTemplates(value.document_templates),
    files: parseFiles(value.files),
  };
}

export function serializeProjectSettingsExtras(
  extras: ProjectSettingsExtras
): Record<string, unknown> {
  return {
    team: extras.team,
    document_templates: extras.document_templates,
    files: extras.files,
  };
}
