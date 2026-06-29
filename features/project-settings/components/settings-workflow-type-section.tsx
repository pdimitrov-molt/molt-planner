"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateProjectWorkflowTypeAction } from "@/features/project-settings/actions/project-settings.actions";
import { SettingsSection } from "@/features/project-settings/components/settings-section";
import type { WorkflowGroupDefinition } from "@/features/workflow-engine/types/workflow-engine";
import {
  WORKFLOW_TYPES,
  WORKFLOW_TYPE_LABELS,
  type WorkflowType,
} from "@/features/project-settings/types/workflow-type";
import { bg } from "@/src/i18n/bg";

interface SettingsWorkflowTypeSectionProps {
  projectId: string;
  workflowType: WorkflowType;
  onWorkflowTypeChange: (
    workflowType: WorkflowType,
    groups: WorkflowGroupDefinition[]
  ) => void;
}

export function SettingsWorkflowTypeSection({
  projectId,
  workflowType,
  onWorkflowTypeChange,
}: SettingsWorkflowTypeSectionProps) {
  const [value, setValue] = useState(workflowType);
  const [isPending, startTransition] = useTransition();

  function handleChange(nextType: WorkflowType) {
    setValue(nextType);

    startTransition(async () => {
      const result = await updateProjectWorkflowTypeAction({
        project_id: projectId,
        workflow_type: nextType,
      });

      if (!result.success) {
        toast.error(result.error);
        setValue(workflowType);
        return;
      }

      onWorkflowTypeChange(result.data.workflow_type, result.data.workflow_groups);
      toast.success(bg.projects.settings.saved, { duration: 1500 });
    });
  }

  return (
    <SettingsSection
      id="settings-workflow-type"
      title={bg.projects.settings.sections.workflowType}
      description={bg.projects.settings.workflowTypeHint}
    >
      <div className="grid max-w-md gap-2">
        <Label htmlFor="settings-workflow-type">{bg.projects.settings.sections.workflowType}</Label>
        <Select
          value={value}
          onValueChange={(next) => handleChange(next as WorkflowType)}
          disabled={isPending}
        >
          <SelectTrigger id="settings-workflow-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WORKFLOW_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {WORKFLOW_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </SettingsSection>
  );
}
