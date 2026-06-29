"use client";

import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

const SECTIONS = [
  { id: "settings-general", label: bg.projects.settings.sections.general },
  { id: "settings-client", label: bg.projects.settings.sections.client },
  { id: "settings-deadlines", label: bg.projects.settings.sections.deadlines },
  { id: "settings-package", label: bg.projects.settings.sections.package },
  { id: "settings-workflow-type", label: bg.projects.settings.sections.workflowType },
  { id: "settings-workflow", label: bg.projects.settings.sections.workflow },
  { id: "settings-rooms", label: bg.projects.settings.sections.rooms },
  { id: "settings-documents", label: bg.projects.settings.sections.documents },
  { id: "settings-team", label: bg.projects.settings.sections.team },
  { id: "settings-files", label: bg.projects.settings.sections.files },
] as const;

export function SettingsNav() {
  return (
    <nav className="sticky top-4 z-10 -mx-1 overflow-x-auto rounded-xl border border-border/60 bg-background/95 p-1 backdrop-blur">
      <ul className="flex min-w-max gap-1">
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={cn(
                "inline-flex rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors",
                "hover:bg-muted/50 hover:text-foreground"
              )}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function settingsSectionId(id: string) {
  return id;
}
