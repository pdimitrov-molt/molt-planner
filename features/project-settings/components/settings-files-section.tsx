"use client";

import { useState, useTransition } from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsSection } from "@/features/project-settings/components/settings-section";
import { useDebouncedCallback } from "@/features/project-settings/lib/use-debounced-callback";
import type { ProjectFileEntry } from "@/features/project-settings/types/project-settings-extras";
import { bg } from "@/src/i18n/bg";

function createFileId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface SettingsFilesSectionProps {
  files: ProjectFileEntry[];
  onSave: (files: ProjectFileEntry[]) => Promise<boolean>;
}

export function SettingsFilesSection({ files, onSave }: SettingsFilesSectionProps) {
  const [entries, setEntries] = useState(files);
  const [isPending, startTransition] = useTransition();

  const debouncedSave = useDebouncedCallback((next: ProjectFileEntry[]) => {
    startTransition(async () => {
      const success = await onSave(next);

      if (success) {
        toast.success(bg.projects.settings.saved, { duration: 1500 });
      }
    });
  }, 400);

  function updateEntries(next: ProjectFileEntry[]) {
    setEntries(next);
    debouncedSave(next);
  }

  function addFile() {
    updateEntries([
      ...entries,
      {
        id: createFileId(),
        name: bg.projects.settings.files.add,
        note: null,
        url: null,
        created_at: new Date().toISOString(),
      },
    ]);
  }

  function removeFile(fileId: string) {
    updateEntries(entries.filter((entry) => entry.id !== fileId));
  }

  function patchFile(fileId: string, patch: Partial<ProjectFileEntry>) {
    updateEntries(
      entries.map((entry) => (entry.id === fileId ? { ...entry, ...patch } : entry))
    );
  }

  return (
    <SettingsSection
      id="settings-files"
      title={bg.projects.settings.sections.files}
      description={bg.projects.settings.files.hint}
    >
      <div className="grid gap-4">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">{bg.projects.settings.files.empty}</p>
        ) : (
          <div className="grid gap-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="grid gap-3 rounded-xl border border-border/50 p-4 sm:grid-cols-[1fr_1fr_1fr_auto]"
              >
                <div className="grid gap-2">
                  <Label>{bg.projects.settings.files.name}</Label>
                  <Input
                    value={entry.name}
                    disabled={isPending}
                    onChange={(event) => patchFile(entry.id, { name: event.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{bg.projects.settings.files.url}</Label>
                  <Input
                    value={entry.url ?? ""}
                    disabled={isPending}
                    onChange={(event) =>
                      patchFile(entry.id, { url: event.target.value || null })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{bg.projects.settings.files.note}</Label>
                  <Input
                    value={entry.note ?? ""}
                    disabled={isPending}
                    onChange={(event) =>
                      patchFile(entry.id, { note: event.target.value || null })
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="self-end"
                  disabled={isPending}
                  onClick={() => removeFile(entry.id)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button type="button" variant="outline" disabled={isPending} onClick={addFile}>
          <PlusIcon className="size-4" />
          {bg.projects.settings.files.add}
        </Button>
      </div>
    </SettingsSection>
  );
}
