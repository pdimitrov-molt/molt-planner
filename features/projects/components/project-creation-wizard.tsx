"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createProjectWizardAction } from "@/features/projects/actions/project.actions";
import { WizardProgress } from "@/features/projects/components/wizard/wizard-progress";
import { WizardStepClient } from "@/features/projects/components/wizard/wizard-step-client";
import { WizardStepProject } from "@/features/projects/components/wizard/wizard-step-project";
import { WizardStepReview } from "@/features/projects/components/wizard/wizard-step-review";
import { WizardStepRooms } from "@/features/projects/components/wizard/wizard-step-rooms";
import type {
  ProjectWizardInput,
  WizardClientSelection,
  WizardProjectInput,
} from "@/features/projects/validation/project-wizard.schema";
import { buildWizardRoomsFromTemplate } from "@/features/rooms/data/room-templates";
import type { WizardRoomDraft } from "@/features/rooms/types/room-template";
import type { Client } from "@/features/clients/types/client";
import { bg } from "@/src/i18n/bg";

interface ProjectCreationWizardProps {
  clients: Client[];
}

function createInitialClientSelection(clients: Client[]): WizardClientSelection {
  if (clients.length > 0) {
    return {
      mode: "existing",
      client_id: clients[0].id,
    };
  }

  return {
    mode: "new",
    client: {
      display_name: "",
      contact_email: undefined,
      preferred_channel: "email",
      decision_style: "collaborative",
    },
  };
}

function createInitialProject(): WizardProjectInput {
  return {
    name: "",
    project_type: "residential",
    site_address: "",
    site_area: null,
    priority: "normal",
  };
}

export function ProjectCreationWizard({ clients }: ProjectCreationWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [clientSelection, setClientSelection] = useState<WizardClientSelection>(
    createInitialClientSelection(clients)
  );
  const [projectInput, setProjectInput] = useState<WizardProjectInput>(
    createInitialProject()
  );
  const [rooms, setRooms] = useState<WizardRoomDraft[]>(
    buildWizardRoomsFromTemplate("residential")
  );

  useEffect(() => {
    setRooms(buildWizardRoomsFromTemplate(projectInput.project_type));
  }, [projectInput.project_type]);

  function validateStep(step: number) {
    if (step === 1) {
      if (clientSelection.mode === "existing" && !clientSelection.client_id) {
        toast.error(bg.projects.wizard.toasts.selectClient);
        return false;
      }

      if (
        clientSelection.mode === "new" &&
        clientSelection.client.display_name.trim().length === 0
      ) {
        toast.error(bg.projects.wizard.toasts.clientNameRequired);
        return false;
      }
    }

    if (step === 2 && projectInput.name.trim().length === 0) {
      toast.error(bg.projects.wizard.toasts.projectNameRequired);
      return false;
    }

    if (step === 3) {
      if (rooms.length === 0) {
        toast.error(bg.projects.wizard.toasts.selectRoom);
        return false;
      }

      if (rooms.some((room) => room.name.trim().length === 0)) {
        toast.error(bg.projects.wizard.toasts.roomNameRequired);
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

  function handleSubmit() {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

    const payload: ProjectWizardInput = {
      client: clientSelection,
      project: projectInput,
      rooms: rooms.map((room, index) => ({
        name: room.name.trim(),
        room_kind: room.room_kind,
        scope_summary: room.scope_summary,
        room_template_key: room.room_template_key,
        sort_order: index,
      })),
    };

    startTransition(async () => {
      const result = await createProjectWizardAction(payload);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(bg.projects.wizard.toasts.created);
      router.push(`/projects/${result.data.id}`);
    });
  }

  return (
    <Card>
      <CardHeader className="gap-3 pb-2">
        <CardTitle className="text-2xl">{bg.projects.wizard.title}</CardTitle>
        <CardDescription className="text-base">
          {bg.projects.wizard.subtitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-10 pt-2">
        <WizardProgress currentStep={currentStep} />

        {currentStep === 1 ? (
          <WizardStepClient
            clients={clients}
            value={clientSelection}
            onChange={setClientSelection}
          />
        ) : null}

        {currentStep === 2 ? (
          <WizardStepProject value={projectInput} onChange={setProjectInput} />
        ) : null}

        {currentStep === 3 ? (
          <WizardStepRooms
            projectType={projectInput.project_type}
            rooms={rooms}
            onChange={setRooms}
          />
        ) : null}

        {currentStep === 4 ? (
          <WizardStepReview
            client={clientSelection}
            clients={clients}
            project={projectInput}
            rooms={rooms}
          />
        ) : null}

        <div className="flex items-center justify-between gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            disabled={currentStep === 1 || isPending}
          >
            {bg.common.back}
          </Button>

          {currentStep < 4 ? (
            <Button type="button" onClick={goNext} disabled={isPending}>
              {bg.common.continue}
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={isPending}>
              {isPending ? bg.projects.wizard.creating : bg.projects.wizard.create}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
