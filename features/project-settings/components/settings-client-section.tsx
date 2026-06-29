"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateProjectClientSettingsAction } from "@/features/project-settings/actions/project-settings.actions";
import { SettingsSection } from "@/features/project-settings/components/settings-section";
import type { ProjectSettingsView } from "@/features/project-settings/types/project-settings";
import type { Client } from "@/features/clients/types/client";
import { PREFERRED_CHANNEL_LABELS } from "@/features/clients/types/client";
import { bg } from "@/src/i18n/bg";

interface SettingsClientSectionProps {
  settings: ProjectSettingsView;
  clients: Client[];
}

export function SettingsClientSection({
  settings,
  clients,
}: SettingsClientSectionProps) {
  const [clientId, setClientId] = useState(settings.project.client_id);
  const selectedClient = clients.find((client) => client.id === clientId) ?? null;
  const [isPending, startTransition] = useTransition();

  function save(nextClientId: string) {
    startTransition(async () => {
      const result = await updateProjectClientSettingsAction({
        project_id: settings.project.id,
        client_id: nextClientId,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(bg.projects.settings.saved, { duration: 1500 });
    });
  }

  return (
    <SettingsSection
      id="settings-client"
      title={bg.projects.settings.sections.client}
      description={bg.projects.settings.clientHint}
    >
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="settings-client">{bg.projects.wizard.existingClient}</Label>
          <Select
            value={clientId}
            onValueChange={(value) => {
              setClientId(value);
              save(value);
            }}
            disabled={isPending}
          >
            <SelectTrigger id="settings-client">
              <SelectValue placeholder={bg.projects.wizard.chooseClient} />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedClient ? (
          <dl className="grid gap-3 rounded-xl border border-border/50 bg-muted/20 p-4 text-sm">
            {selectedClient.contact_email ? (
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Email</dt>
                <dd>{selectedClient.contact_email}</dd>
              </div>
            ) : null}
            {selectedClient.contact_phone ? (
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Телефон</dt>
                <dd>{selectedClient.contact_phone}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Канал</dt>
              <dd>{PREFERRED_CHANNEL_LABELS[selectedClient.preferred_channel]}</dd>
            </div>
          </dl>
        ) : null}
      </div>
    </SettingsSection>
  );
}
