"use client";

import type { Client } from "@/features/clients/types/client";
import {
  DECISION_STYLE_LABELS,
  PREFERRED_CHANNEL_LABELS,
} from "@/features/clients/types/client";
import { DEFAULT_PHASE_SEQUENCE, PHASE_KIND_LABELS } from "@/features/phases/types/phase";
import {
  getProjectTypeLabel,
  PROJECT_PRIORITY_LABELS,
} from "@/features/projects/types/project";
import type {
  ProjectWizardInput,
  WizardClientSelection,
} from "@/features/projects/validation/project-wizard.schema";
import type { WizardRoomDraft } from "@/features/rooms/types/room-template";
import { ROOM_KIND_LABELS } from "@/features/rooms/types/room";
import { bg } from "@/src/i18n/bg";

interface WizardStepReviewProps {
  client: WizardClientSelection;
  clients: Client[];
  project: ProjectWizardInput["project"];
  rooms: WizardRoomDraft[];
}

function resolveClientLabel(client: WizardClientSelection, clients: Client[]) {
  if (client.mode === "new") {
    return client.client.display_name || bg.projects.wizard.newClient;
  }

  return (
    clients.find((entry) => entry.id === client.client_id)?.display_name ??
    bg.projects.wizard.chooseClient
  );
}

export function WizardStepReview({
  client,
  clients,
  project,
  rooms,
}: WizardStepReviewProps) {
  return (
    <div className="grid gap-8">
      <section className="surface-card p-6">
        <h3 className="text-section-title">{bg.projects.wizard.review.client}</h3>
        <dl className="mt-4 grid gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{bg.projects.wizard.review.name}</dt>
            <dd>{resolveClientLabel(client, clients)}</dd>
          </div>
          {client.mode === "new" ? (
            <>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">
                  {bg.projects.wizard.preferredChannel}
                </dt>
                <dd>{PREFERRED_CHANNEL_LABELS[client.client.preferred_channel]}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">
                  {bg.projects.wizard.decisionStyle}
                </dt>
                <dd>{DECISION_STYLE_LABELS[client.client.decision_style]}</dd>
              </div>
            </>
          ) : null}
        </dl>
      </section>

      <section className="surface-card p-6">
        <h3 className="text-section-title">{bg.projects.wizard.review.project}</h3>
        <dl className="mt-4 grid gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{bg.projects.wizard.review.name}</dt>
            <dd>{project.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{bg.projects.wizard.review.type}</dt>
            <dd>{getProjectTypeLabel(project.project_type)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{bg.projects.wizard.priority}</dt>
            <dd>{PROJECT_PRIORITY_LABELS[project.priority]}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{bg.projects.wizard.review.address}</dt>
            <dd>{project.site_address || bg.common.empty}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{bg.projects.wizard.review.area}</dt>
            <dd>
              {project.site_area
                ? `${project.site_area.toLocaleString()} m²`
                : bg.common.empty}
            </dd>
          </div>
        </dl>
      </section>

      <section className="surface-card p-6">
        <h3 className="text-section-title">{bg.projects.wizard.review.roomsPhases}</h3>
        <p className="mt-3 text-body">
          {bg.projects.wizard.review.roomsCreated(
            rooms.length,
            DEFAULT_PHASE_SEQUENCE.length
          )}
        </p>
        <ul className="mt-5 grid gap-4">
          {rooms.map((room) => (
            <li key={room.key} className="surface-panel text-sm">
              <p className="text-section-title">
                {room.name} · {ROOM_KIND_LABELS[room.room_kind]}
              </p>
              <p className="mt-2 text-muted-foreground">
                {DEFAULT_PHASE_SEQUENCE.map((phase) => PHASE_KIND_LABELS[phase]).join(
                  " → "
                )}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
