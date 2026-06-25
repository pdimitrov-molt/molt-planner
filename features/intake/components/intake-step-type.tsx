"use client";

import { Label } from "@/components/ui/label";
import {
  PROJECT_TYPES,
  getProjectTypeLabel,
  type ProjectType,
} from "@/features/projects/types/project";
import { getRoomTemplateSet } from "@/features/rooms/data/room-templates";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

interface IntakeStepTypeProps {
  value: ProjectType;
  onChange: (projectType: ProjectType) => void;
}

export function IntakeStepType({ value, onChange }: IntakeStepTypeProps) {
  return (
    <div className="grid gap-6">
      <Label>{bg.intake.type.prompt}</Label>
      <div className="grid gap-4 sm:grid-cols-2">
        {PROJECT_TYPES.map((projectType) => {
          const templateSet = getRoomTemplateSet(projectType);
          const isSelected = value === projectType;

          return (
            <button
              key={projectType}
              type="button"
              className={cn(
                "surface-selectable text-left",
                isSelected && "surface-selectable-selected"
              )}
              onClick={() => onChange(projectType)}
            >
              <p className="text-section-title">{getProjectTypeLabel(projectType)}</p>
              <p className="mt-2 text-body">
                {templateSet?.description ??
                  bg.intake.type.fallbackDescription(getProjectTypeLabel(projectType))}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
