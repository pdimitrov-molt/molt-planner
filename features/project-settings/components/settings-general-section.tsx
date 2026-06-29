"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateProjectGeneralSettingsAction } from "@/features/project-settings/actions/project-settings.actions";
import { SettingsSection } from "@/features/project-settings/components/settings-section";
import { useDebouncedCallback } from "@/features/project-settings/lib/use-debounced-callback";
import type { ProjectSettingsView } from "@/features/project-settings/types/project-settings";
import {
  ENGAGEMENT_STATUSES,
  PROJECT_CATEGORIES,
  PROJECT_CATEGORY_LABELS,
  PROJECT_OBJECT_TYPES,
  PROJECT_OBJECT_TYPE_LABELS,
  PROJECT_PRIORITIES,
  PROJECT_PRIORITY_LABELS,
  ENGAGEMENT_STATUS_LABELS,
} from "@/features/projects/types/project";
import { bg } from "@/src/i18n/bg";

interface SettingsGeneralSectionProps {
  settings: ProjectSettingsView;
}

export function SettingsGeneralSection({ settings }: SettingsGeneralSectionProps) {
  const [form, setForm] = useState({
    name: settings.project.name,
    project_number: settings.project.project_number,
    category: settings.project.category,
    object_type: settings.project.object_type,
    site_address: settings.project.site_address ?? "",
    site_area: settings.project.site_area,
    engagement_status: settings.project.engagement_status,
    priority: settings.project.priority,
  });
  const [isPending, startTransition] = useTransition();

  function save(next: typeof form) {
    startTransition(async () => {
      const result = await updateProjectGeneralSettingsAction({
        project_id: settings.project.id,
        ...next,
        site_address: next.site_address,
        site_area: next.site_area,
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

    if (key === "name" || key === "project_number" || key === "site_address") {
      debouncedSave(next);
      return;
    }

    save(next);
  }

  return (
    <SettingsSection
      id="settings-general"
      title={bg.projects.settings.sections.general}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="settings-project-name">{bg.projects.wizard.projectName}</Label>
            <Input
              id="settings-project-name"
              value={form.name}
              disabled={isPending}
              onChange={(event) => update("name", event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="settings-project-number">
              {bg.projects.settings.projectNumber}
            </Label>
            <Input
              id="settings-project-number"
              value={form.project_number}
              disabled={isPending}
              onChange={(event) => update("project_number", event.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>{bg.projects.workspace.engagement}</Label>
            <Select
              value={form.engagement_status}
              onValueChange={(value) =>
                update("engagement_status", value as typeof form.engagement_status)
              }
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENGAGEMENT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {ENGAGEMENT_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>{bg.projects.wizard.priority}</Label>
            <Select
              value={form.priority}
              onValueChange={(value) =>
                update("priority", value as typeof form.priority)
              }
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_PRIORITIES.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {PROJECT_PRIORITY_LABELS[priority]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label>{bg.projects.settings.classification}</Label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              value={form.category}
              onValueChange={(value) =>
                update("category", value as typeof form.category)
              }
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {PROJECT_CATEGORY_LABELS[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={form.object_type}
              onValueChange={(value) =>
                update("object_type", value as typeof form.object_type)
              }
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_OBJECT_TYPES.map((objectType) => (
                  <SelectItem key={objectType} value={objectType}>
                    {PROJECT_OBJECT_TYPE_LABELS[objectType]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label>{bg.projects.settings.siteDetails}</Label>
          <Textarea
            value={form.site_address}
            disabled={isPending}
            onChange={(event) => update("site_address", event.target.value)}
          />
          <Input
            type="number"
            min="0"
            step="0.1"
            className="max-w-xs"
            placeholder={bg.projects.wizard.siteArea}
            value={form.site_area ?? ""}
            disabled={isPending}
            onChange={(event) =>
              update(
                "site_area",
                event.target.value === "" ? null : Number(event.target.value)
              )
            }
          />
        </div>
      </div>
    </SettingsSection>
  );
}
