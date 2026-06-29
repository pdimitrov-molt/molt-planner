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
import { updateProjectPackageSettingsAction } from "@/features/project-settings/actions/project-settings.actions";
import { SettingsSection } from "@/features/project-settings/components/settings-section";
import type { ProjectSettingsView } from "@/features/project-settings/types/project-settings";
import {
  PROJECT_PACKAGES,
  PROJECT_PACKAGE_LABELS,
} from "@/features/projects/types/project";
import { bg } from "@/src/i18n/bg";

interface SettingsPackageSectionProps {
  settings: ProjectSettingsView;
}

export function SettingsPackageSection({ settings }: SettingsPackageSectionProps) {
  const [projectPackage, setProjectPackage] = useState(settings.project.package);
  const [isPending, startTransition] = useTransition();

  function save(nextPackage: typeof projectPackage) {
    startTransition(async () => {
      const result = await updateProjectPackageSettingsAction({
        project_id: settings.project.id,
        package: nextPackage,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(bg.projects.settings.saved, { duration: 1500 });
    });
  }

  return (
    <SettingsSection
      id="settings-package"
      title={bg.projects.settings.sections.package}
      description={bg.projects.settings.packageHint}
    >
      <div className="grid max-w-md gap-2">
        <Label>{bg.projects.wizard.package}</Label>
        <Select
          value={projectPackage}
          onValueChange={(value) => {
            const next = value as typeof projectPackage;
            setProjectPackage(next);
            save(next);
          }}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROJECT_PACKAGES.map((entry) => (
              <SelectItem key={entry} value={entry}>
                {PROJECT_PACKAGE_LABELS[entry]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </SettingsSection>
  );
}
