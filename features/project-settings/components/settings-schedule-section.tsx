"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProjectScheduleSettingsAction } from "@/features/project-settings/actions/project-settings.actions";
import { SettingsSection } from "@/features/project-settings/components/settings-section";
import { useDebouncedCallback } from "@/features/project-settings/lib/use-debounced-callback";
import type { ProjectSettingsView } from "@/features/project-settings/types/project-settings";
import { bg } from "@/src/i18n/bg";

interface SettingsScheduleSectionProps {
  settings: ProjectSettingsView;
}

export function SettingsScheduleSection({ settings }: SettingsScheduleSectionProps) {
  const [form, setForm] = useState({
    design_deadline: settings.project.design_deadline,
    execution_deadline: settings.project.execution_deadline,
    move_in_date: settings.project.move_in_date,
    estimated_design_hours: settings.estimated_design_hours,
    estimated_execution_hours: settings.estimated_execution_hours,
  });
  const [isPending, startTransition] = useTransition();

  function save(next: typeof form) {
    startTransition(async () => {
      const result = await updateProjectScheduleSettingsAction({
        project_id: settings.project.id,
        ...next,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(bg.projects.settings.saved, { duration: 1500 });
    });
  }

  const debouncedSave = useDebouncedCallback(save, 400);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    const next = { ...form, [key]: value };
    setForm(next);

    if (key === "estimated_design_hours" || key === "estimated_execution_hours") {
      debouncedSave(next);
      return;
    }

    save(next);
  }

  return (
    <SettingsSection title={bg.projects.settings.sections.schedule}>
      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="settings-design-deadline">
              {bg.projects.wizard.designDeadline}
            </Label>
            <Input
              id="settings-design-deadline"
              type="date"
              value={form.design_deadline ?? ""}
              disabled={isPending}
              onChange={(event) =>
                update("design_deadline", event.target.value || null)
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="settings-execution-deadline">
              {bg.projects.wizard.executionDeadline}
            </Label>
            <Input
              id="settings-execution-deadline"
              type="date"
              value={form.execution_deadline ?? ""}
              disabled={isPending}
              onChange={(event) =>
                update("execution_deadline", event.target.value || null)
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="settings-move-in-date">{bg.projects.wizard.moveInDate}</Label>
            <Input
              id="settings-move-in-date"
              type="date"
              value={form.move_in_date ?? ""}
              disabled={isPending}
              onChange={(event) =>
                update("move_in_date", event.target.value || null)
              }
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="settings-design-hours">
              {bg.projects.settings.estimatedDesignHours}
            </Label>
            <Input
              id="settings-design-hours"
              type="number"
              min="0"
              step="0.5"
              value={form.estimated_design_hours ?? ""}
              disabled={isPending}
              onChange={(event) =>
                update(
                  "estimated_design_hours",
                  event.target.value === "" ? null : Number(event.target.value)
                )
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="settings-execution-hours">
              {bg.projects.settings.estimatedExecutionHours}
            </Label>
            <Input
              id="settings-execution-hours"
              type="number"
              min="0"
              step="0.5"
              value={form.estimated_execution_hours ?? ""}
              disabled={isPending}
              onChange={(event) =>
                update(
                  "estimated_execution_hours",
                  event.target.value === "" ? null : Number(event.target.value)
                )
              }
            />
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
