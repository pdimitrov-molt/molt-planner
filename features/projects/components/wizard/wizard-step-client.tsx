"use client";

import type { Client } from "@/features/clients/types/client";
import {
  DECISION_STYLE_LABELS,
  PREFERRED_CHANNEL_LABELS,
} from "@/features/clients/types/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { WizardClientSelection } from "@/features/projects/validation/project-wizard.schema";
import { bg } from "@/src/i18n/bg";

interface WizardStepClientProps {
  clients: Client[];
  value: WizardClientSelection;
  onChange: (value: WizardClientSelection) => void;
}

export function WizardStepClient({
  clients,
  value,
  onChange,
}: WizardStepClientProps) {
  return (
    <div className="grid gap-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          className={cn(
            "surface-selectable text-left",
            value.mode === "existing" && "surface-selectable-selected"
          )}
          onClick={() =>
            onChange({
              mode: "existing",
              client_id: value.mode === "existing" ? value.client_id : clients[0]?.id ?? "",
            })
          }
        >
          <p className="text-section-title">{bg.projects.wizard.existingClient}</p>
          <p className="text-body">
            {bg.projects.wizard.existingClientHint}
          </p>
        </button>
        <button
          type="button"
          className={cn(
            "surface-selectable text-left",
            value.mode === "new" && "surface-selectable-selected"
          )}
          onClick={() =>
            onChange({
              mode: "new",
              client: {
                display_name: "",
                contact_email: undefined,
                preferred_channel: "email",
                decision_style: "collaborative",
              },
            })
          }
        >
          <p className="text-section-title">{bg.projects.wizard.newClient}</p>
          <p className="text-body">
            {bg.projects.wizard.newClientHint}
          </p>
        </button>
      </div>

      {value.mode === "existing" ? (
        <div className="grid gap-2">
          <Label htmlFor="existing-client">{bg.projects.wizard.selectClient}</Label>
          <Select
            value={value.client_id}
            onValueChange={(clientId) =>
              onChange({ mode: "existing", client_id: clientId })
            }
          >
            <SelectTrigger id="existing-client">
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
      ) : (
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="client-name">{bg.projects.wizard.clientName}</Label>
            <Input
              id="client-name"
              value={value.client.display_name}
              onChange={(event) =>
                onChange({
                  mode: "new",
                  client: { ...value.client, display_name: event.target.value },
                })
              }
              placeholder={bg.projects.wizard.clientNamePlaceholder}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="preferred-channel">
                {bg.projects.wizard.preferredChannel}
              </Label>
              <Select
                value={value.client.preferred_channel}
                onValueChange={(preferredChannel) =>
                  onChange({
                    mode: "new",
                    client: {
                      ...value.client,
                      preferred_channel: preferredChannel as typeof value.client.preferred_channel,
                    },
                  })
                }
              >
                <SelectTrigger id="preferred-channel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PREFERRED_CHANNEL_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="decision-style">{bg.projects.wizard.decisionStyle}</Label>
              <Select
                value={value.client.decision_style}
                onValueChange={(decisionStyle) =>
                  onChange({
                    mode: "new",
                    client: {
                      ...value.client,
                      decision_style: decisionStyle as typeof value.client.decision_style,
                    },
                  })
                }
              >
                <SelectTrigger id="decision-style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DECISION_STYLE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="client-notes">{bg.projects.wizard.clientNotes}</Label>
            <Textarea
              id="client-notes"
              value={value.client.notes ?? ""}
              onChange={(event) =>
                onChange({
                  mode: "new",
                  client: { ...value.client, notes: event.target.value },
                })
              }
              placeholder={bg.projects.wizard.clientNotesPlaceholder}
            />
          </div>
        </div>
      )}
    </div>
  );
}
