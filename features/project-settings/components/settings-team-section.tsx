"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsSection } from "@/features/project-settings/components/settings-section";
import { useDebouncedCallback } from "@/features/project-settings/lib/use-debounced-callback";
import type { ProjectTeamSettings } from "@/features/project-settings/types/project-settings-extras";
import { bg } from "@/src/i18n/bg";

interface SettingsTeamSectionProps {
  team: ProjectTeamSettings;
  onSave: (team: ProjectTeamSettings) => Promise<boolean>;
}

export function SettingsTeamSection({ team, onSave }: SettingsTeamSectionProps) {
  const [form, setForm] = useState(team);
  const [isPending, startTransition] = useTransition();

  const debouncedSave = useDebouncedCallback((next: ProjectTeamSettings) => {
    startTransition(async () => {
      const success = await onSave(next);

      if (success) {
        toast.success(bg.projects.settings.saved, { duration: 1500 });
      }
    });
  }, 400);

  function update<K extends keyof ProjectTeamSettings>(
    key: K,
    value: ProjectTeamSettings[K]
  ) {
    const next = { ...form, [key]: value };
    setForm(next);
    debouncedSave(next);
  }

  const fields: Array<{ key: keyof ProjectTeamSettings; label: string }> = [
    { key: "designer", label: bg.projects.settings.team.designer },
    { key: "visualizer", label: bg.projects.settings.team.visualizer },
    { key: "technical_designer", label: bg.projects.settings.team.technicalDesigner },
    { key: "project_manager", label: bg.projects.settings.team.projectManager },
  ];

  return (
    <SettingsSection
      id="settings-team"
      title={bg.projects.settings.sections.team}
      description={bg.projects.settings.team.hint}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key} className="grid gap-2">
            <Label htmlFor={`settings-team-${field.key}`}>{field.label}</Label>
            <Input
              id={`settings-team-${field.key}`}
              value={form[field.key]}
              disabled={isPending}
              onChange={(event) => update(field.key, event.target.value)}
            />
          </div>
        ))}
      </div>
    </SettingsSection>
  );
}
