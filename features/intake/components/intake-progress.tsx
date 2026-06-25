"use client";

import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

const INTAKE_STEPS = [
  { number: 1, label: bg.intake.steps.type },
  { number: 2, label: bg.intake.steps.scope },
  { number: 3, label: bg.intake.steps.estimate },
  { number: 4, label: bg.intake.steps.scheduleFit },
] as const;

interface IntakeProgressProps {
  currentStep: number;
}

export function IntakeProgress({ currentStep }: IntakeProgressProps) {
  return (
    <ol className="grid gap-4 sm:grid-cols-4">
      {INTAKE_STEPS.map((step) => {
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
