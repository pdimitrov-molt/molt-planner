"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { updateProjectSettingsExtrasAction } from "@/features/project-settings/actions/project-settings.actions";
import { SettingsClientSection } from "@/features/project-settings/components/settings-client-section";
import { SettingsDeadlinesSection } from "@/features/project-settings/components/settings-deadlines-section";
import { SettingsDocumentsSection } from "@/features/project-settings/components/settings-documents-section";
import { SettingsFilesSection } from "@/features/project-settings/components/settings-files-section";
import { SettingsGeneralSection } from "@/features/project-settings/components/settings-general-section";
import { SettingsNav } from "@/features/project-settings/components/settings-nav";
import { SettingsPackageSection } from "@/features/project-settings/components/settings-package-section";
import { SettingsRoomsSection } from "@/features/project-settings/components/settings-rooms-section";
import { SettingsTeamSection } from "@/features/project-settings/components/settings-team-section";
import { SettingsWorkflowGroupsSection } from "@/features/project-settings/components/settings-workflow-groups-section";
import { SettingsWorkflowTypeSection } from "@/features/project-settings/components/settings-workflow-type-section";
import type { ProjectSettingsView } from "@/features/project-settings/types/project-settings";
import type { ProjectSettingsExtras } from "@/features/project-settings/types/project-settings-extras";
import type { WorkflowGroupDefinition } from "@/features/workflow-engine/types/workflow-engine";
import type { WorkflowType } from "@/features/project-settings/types/workflow-type";
import type { Client } from "@/features/clients/types/client";
import type { Room } from "@/features/rooms/types/room";

interface ProjectSettingsFormProps {
  initialSettings: ProjectSettingsView;
  clients: Client[];
}

export function ProjectSettingsForm({
  initialSettings,
  clients,
}: ProjectSettingsFormProps) {
  const [workflowType, setWorkflowType] = useState(initialSettings.workflow_type);
  const [workflowGroups, setWorkflowGroups] = useState(
    initialSettings.workflow_groups
  );
  const [rooms, setRooms] = useState<Room[]>(initialSettings.rooms);
  const [settingsExtras, setSettingsExtras] = useState<ProjectSettingsExtras>(
    initialSettings.settings_extras
  );

  function handleWorkflowTypeChange(
    nextType: WorkflowType,
    groups: WorkflowGroupDefinition[]
  ) {
    setWorkflowType(nextType);
    setWorkflowGroups(groups);
  }

  const saveSettingsExtras = useCallback(
    async (patch: Partial<ProjectSettingsExtras>): Promise<boolean> => {
      const next: ProjectSettingsExtras = {
        ...settingsExtras,
        ...patch,
      };

      const result = await updateProjectSettingsExtrasAction({
        project_id: initialSettings.project.id,
        team: next.team,
        document_templates: next.document_templates,
        files: next.files,
      });

      if (!result.success) {
        toast.error(result.error);
        return false;
      }

      setSettingsExtras(result.data);
      return true;
    },
    [initialSettings.project.id, settingsExtras]
  );

  return (
    <div className="grid gap-6">
      <SettingsNav />

      <SettingsGeneralSection settings={initialSettings} />
      <SettingsClientSection settings={initialSettings} clients={clients} />
      <SettingsDeadlinesSection settings={initialSettings} />
      <SettingsPackageSection settings={initialSettings} />

      <SettingsWorkflowTypeSection
        projectId={initialSettings.project.id}
        workflowType={workflowType}
        onWorkflowTypeChange={handleWorkflowTypeChange}
      />
      <SettingsWorkflowGroupsSection
        projectId={initialSettings.project.id}
        groups={workflowGroups}
        rooms={rooms}
        onGroupsChange={setWorkflowGroups}
      />

      <SettingsRoomsSection
        settings={{ ...initialSettings, rooms }}
        onRoomsChange={setRooms}
      />

      <SettingsDocumentsSection
        documentTemplates={settingsExtras.document_templates}
        onSave={async (patch) => saveSettingsExtras(patch)}
      />

      <SettingsTeamSection
        team={settingsExtras.team}
        onSave={async (team) => saveSettingsExtras({ team })}
      />

      <SettingsFilesSection
        files={settingsExtras.files}
        onSave={async (files) => saveSettingsExtras({ files })}
      />
    </div>
  );
}
