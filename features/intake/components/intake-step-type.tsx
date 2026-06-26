"use client";

import { Label } from "@/components/ui/label";
import {
  PROJECT_CATEGORIES,
  getProjectCategoryLabel,
  type ProjectCategory,
} from "@/features/projects/types/project";
import { getRoomTemplateSet } from "@/features/rooms/data/room-templates";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

interface IntakeStepTypeProps {
  value: ProjectCategory;
  onChange: (category: ProjectCategory) => void;
}

export function IntakeStepType({ value, onChange }: IntakeStepTypeProps) {
  return (
    <div className="grid gap-6">
      <Label>{bg.intake.type.prompt}</Label>
      <div className="grid gap-4 sm:grid-cols-2">
        {PROJECT_CATEGORIES.map((category) => {
          const templateSet = getRoomTemplateSet(category);
          const isSelected = value === category;

          return (
            <button
              key={category}
              type="button"
              className={cn(
                "surface-selectable text-left",
                isSelected && "surface-selectable-selected"
              )}
              onClick={() => onChange(category)}
            >
              <p className="text-section-title">{getProjectCategoryLabel(category)}</p>
              <p className="mt-2 text-body">
                {templateSet?.description ??
                  bg.intake.type.fallbackDescription(getProjectCategoryLabel(category))}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
