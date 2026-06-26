"use client";

import type { Client } from "@/features/clients/types/client";
import { PREFERRED_CHANNEL_LABELS } from "@/features/clients/types/client";
import { DEFAULT_PHASE_SEQUENCE, PHASE_KIND_LABELS } from "@/features/phases/types/phase";
import {
  getProjectCategoryLabel,
  getProjectClassificationLabel,
  getProjectObjectTypeLabel,
  getProjectPackageLabel,
  PROJECT_PRIORITY_LABELS,
} from "@/features/projects/types/project";
import type {
  ProjectWizardInput,
  WizardClientSelection,
} from "@/features/projects/validation/project-wizard.schema";
import type { WizardRoomDraft } from "@/features/rooms/types/room-template";
import { ROOM_KIND_LABELS } from "@/features/rooms/types/room";
import { bg } from "@/src/i18n/bg";
import { formatLongDate } from "@/src/i18n/format";

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

function formatOptionalDate(value: string | null | undefined) {
  if (!value) {
    return bg.common.empty;
  }

  return formatLongDate(value);
}

export function WizardStepReview({
  client,
  clients,
  project,
  rooms,
}: WizardStepReviewProps) {
  return (
    <div className="grid gap-8">
      <section className="surface-card rounded-2xl p-6 shadow-sm">
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
              {client.client.contact_phone ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">
                    {bg.projects.wizard.contactPhone}
                  </dt>
                  <dd>{client.client.contact_phone}</dd>
                </div>
              ) : null}
              {client.client.contact_email ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">
                    {bg.projects.wizard.contactEmail}
                  </dt>
                  <dd>{client.client.contact_email}</dd>
                </div>
              ) : null}
            </>
          ) : null}
        </dl>
      </section>

      <section className="surface-card rounded-2xl p-6 shadow-sm">
        <h3 className="text-section-title">{bg.projects.wizard.review.project}</h3>
        <dl className="mt-4 grid gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{bg.projects.wizard.review.name}</dt>
            <dd>{project.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{bg.projects.wizard.category}</dt>
            <dd>{getProjectCategoryLabel(project.category)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{bg.projects.wizard.objectType}</dt>
            <dd>{getProjectObjectTypeLabel(project.object_type)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{bg.projects.wizard.package}</dt>
            <dd>{getProjectPackageLabel(project.package)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{bg.projects.wizard.review.classification}</dt>
            <dd>{getProjectClassificationLabel(project)}</dd>
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
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{bg.projects.wizard.designDeadline}</dt>
            <dd>{formatOptionalDate(project.design_deadline)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">
              {bg.projects.wizard.executionDeadline}
            </dt>
            <dd>{formatOptionalDate(project.execution_deadline)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{bg.projects.wizard.moveInDate}</dt>
            <dd>{formatOptionalDate(project.move_in_date)}</dd>
          </div>
        </dl>
      </section>

      <section className="surface-card rounded-2xl p-6 shadow-sm">
        <h3 className="text-section-title">{bg.projects.wizard.review.roomsPhases}</h3>
        <p className="mt-3 text-body">
          {bg.projects.wizard.review.roomsCreated(
            rooms.length,
            DEFAULT_PHASE_SEQUENCE.length
          )}
        </p>
        <ul className="mt-5 grid gap-4">
          {rooms.map((room) => (
            <li key={room.key} className="surface-panel rounded-2xl text-sm shadow-sm">
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
