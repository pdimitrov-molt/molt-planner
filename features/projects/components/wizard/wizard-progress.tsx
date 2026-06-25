"use client";

import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

const WIZARD_STEPS = [
  { number: 1, label: bg.projects.wizard.steps.client },
  { number: 2, label: bg.projects.wizard.steps.project },
  { number: 3, label: bg.projects.wizard.steps.rooms },
  { number: 4, label: bg.projects.wizard.steps.review },
] as const;

interface WizardProgressProps {
  currentStep: number;
}

export function WizardProgress({ currentStep }: WizardProgressProps) {
  return (
    <ol className="grid gap-4 sm:grid-cols-4">
      {WIZARD_STEPS.map((step) => {
        const isActive = step.number === currentStep;
        const isComplete = step.number < currentStep;

        return (
          <li
            key={step.number}
            className={cn(
              "surface-panel text-sm",
              isActive && "surface-selectable-selected",
              isComplete && "bg-muted/50",
              !isActive && !isComplete && "bg-card"
            )}
          >
            <p className="font-medium">
              {bg.common.step} {step.number}
            </p>
            <p className="text-muted-foreground">{step.label}</p>
          </li>
        );
      })}
    </ol>
  );
}
