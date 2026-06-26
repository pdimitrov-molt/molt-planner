"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IntakeProgress } from "@/features/intake/components/intake-progress";
import { IntakeStepComparison } from "@/features/intake/components/intake-step-comparison";
import { IntakeStepEstimate } from "@/features/intake/components/intake-step-estimate";
import { IntakeStepScope } from "@/features/intake/components/intake-step-scope";
import { IntakeStepType } from "@/features/intake/components/intake-step-type";
import { calculateIntakePlan } from "@/features/intake/lib/calculate-intake-plan";
import type {
  IntakeScopeInput,
  IntakeStudioContext,
} from "@/features/intake/types/intake-plan";
import type { ProjectCategory } from "@/features/projects/types/project";
import { buildWizardRoomsFromTemplate } from "@/features/rooms/data/room-templates";
import { bg } from "@/src/i18n/bg";

interface IntakePlannerProps {
  studio: IntakeStudioContext;
}

function createInitialScope(category: ProjectCategory): IntakeScopeInput {
  const defaultRooms = buildWizardRoomsFromTemplate(category);

  return {
    mode: "template",
    site_area: null,
    approximate_room_count: defaultRooms.length,
    selected_template_room_keys: defaultRooms
      .map((room) => room.room_template_key)
      .filter((key): key is string => key !== null),
  };
}

export function IntakePlanner({ studio }: IntakePlannerProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [category, setCategory] = useState<ProjectCategory>("residential");
  const [scope, setScope] = useState<IntakeScopeInput>(() =>
    createInitialScope("residential")
  );

  function handleCategoryChange(nextCategory: ProjectCategory) {
    setCategory(nextCategory);
    setScope(createInitialScope(nextCategory));
  }

  const simulation = useMemo(
    () => calculateIntakePlan({ category, scope }, studio),
    [category, scope, studio]
  );

  function validateStep(step: number) {
    if (step === 2) {
      if (scope.mode === "manual" && scope.approximate_room_count < 1) {
        toast.error(bg.intake.toasts.roomRequired);
        return false;
      }

      if (
        scope.mode === "template" &&
        scope.selected_template_room_keys.length === 0
      ) {
        toast.error(bg.intake.toasts.templateRoomRequired);
        return false;
      }
    }

    return true;
  }

  function goNext() {
    if (!validateStep(currentStep)) {
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, 4));
  }

  function goBack() {
    setCurrentStep((step) => Math.max(step - 1, 1));
  }

  return (
    <Card>
      <CardHeader className="gap-3 pb-2">
        <CardTitle className="text-title">{bg.intake.cardTitle}</CardTitle>
        <CardDescription>{bg.intake.cardSubtitle}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-10 pt-2">
        <IntakeProgress currentStep={currentStep} />

        {currentStep === 1 ? (
          <IntakeStepType value={category} onChange={handleCategoryChange} />
        ) : null}

        {currentStep === 2 ? (
          <IntakeStepScope category={category} value={scope} onChange={setScope} />
        ) : null}

        {currentStep === 3 ? <IntakeStepEstimate result={simulation} /> : null}

        {currentStep === 4 ? (
          <IntakeStepComparison result={simulation} studio={studio} />
        ) : null}

        <div className="flex items-center justify-between gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            disabled={currentStep === 1}
          >
            {bg.common.back}
          </Button>

          {currentStep < 4 ? (
            <Button type="button" onClick={goNext}>
              {bg.common.continue}
            </Button>
          ) : (
            <Button type="button" variant="outline" asChild>
              <Link href="/projects/new">{bg.intake.proceedToCreation}</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
