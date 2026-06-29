"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { SettingsStageDocumentItems } from "@/features/project-settings/components/settings-stage-document-items";
import { SettingsSection } from "@/features/project-settings/components/settings-section";
import { normalizeDocumentItems } from "@/features/project-settings/lib/stage-settings-helpers";
import type { ProjectSettingsExtras } from "@/features/project-settings/types/project-settings-extras";
import type { WorkflowDocumentItemDefinition } from "@/features/workflow-engine/types/workflow-engine";
import { bg } from "@/src/i18n/bg";

interface SettingsDocumentsSectionProps {
  documentTemplates: WorkflowDocumentItemDefinition[];
  disabled?: boolean;
  onSave: (extras: Pick<ProjectSettingsExtras, "document_templates">) => Promise<boolean>;
}

export function SettingsDocumentsSection({
  documentTemplates,
  disabled = false,
  onSave,
}: SettingsDocumentsSectionProps) {
  const [isPending, startTransition] = useTransition();

  function handleChange(items: WorkflowDocumentItemDefinition[]) {
    const nextItems = normalizeDocumentItems(items);

    startTransition(async () => {
      const success = await onSave({ document_templates: nextItems });

      if (success) {
        toast.success(bg.projects.settings.saved, { duration: 1500 });
      }
    });
  }

  return (
    <SettingsSection
      id="settings-documents"
      title={bg.projects.settings.sections.documents}
      description={bg.projects.settings.documents.hint}
    >
      <SettingsStageDocumentItems
        items={documentTemplates}
        disabled={disabled || isPending}
        onChange={handleChange}
      />
    </SettingsSection>
  );
}
