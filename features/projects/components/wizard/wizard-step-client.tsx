"use client";

import type { Client } from "@/features/clients/types/client";
import { PREFERRED_CHANNEL_LABELS } from "@/features/clients/types/client";
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

const EMPTY_NEW_CLIENT = {
  display_name: "",
  contact_phone: undefined,
  contact_email: undefined,
  contact_viber: undefined,
  contact_whatsapp: undefined,
  secondary_contact: undefined,
  preferred_channel: "email" as const,
  client_insights: undefined,
};

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
          <p className="text-body">{bg.projects.wizard.existingClientHint}</p>
        </button>
        <button
          type="button"
          className={cn(
            "surface-selectable text-left",
            value.mode === "new" && "surface-selectable-selected"
          )}
          onClick={() => onChange({ mode: "new", client: EMPTY_NEW_CLIENT })}
        >
          <p className="text-section-title">{bg.projects.wizard.newClient}</p>
          <p className="text-body">{bg.projects.wizard.newClientHint}</p>
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
        <div className="grid gap-8">
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

          <div className="grid gap-4">
            <p className="text-section-title">{bg.projects.wizard.clientContacts}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="contact-phone">{bg.projects.wizard.contactPhone}</Label>
                <Input
                  id="contact-phone"
                  value={value.client.contact_phone ?? ""}
                  onChange={(event) =>
                    onChange({
                      mode: "new",
                      client: { ...value.client, contact_phone: event.target.value },
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact-email">{bg.projects.wizard.contactEmail}</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={value.client.contact_email ?? ""}
                  onChange={(event) =>
                    onChange({
                      mode: "new",
                      client: { ...value.client, contact_email: event.target.value },
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact-viber">{bg.projects.wizard.contactViber}</Label>
                <Input
                  id="contact-viber"
                  value={value.client.contact_viber ?? ""}
                  onChange={(event) =>
                    onChange({
                      mode: "new",
                      client: { ...value.client, contact_viber: event.target.value },
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact-whatsapp">
                  {bg.projects.wizard.contactWhatsapp}
                </Label>
                <Input
                  id="contact-whatsapp"
                  value={value.client.contact_whatsapp ?? ""}
                  onChange={(event) =>
                    onChange({
                      mode: "new",
                      client: { ...value.client, contact_whatsapp: event.target.value },
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="secondary-contact">
                {bg.projects.wizard.secondaryContact}
              </Label>
              <Input
                id="secondary-contact"
                value={value.client.secondary_contact ?? ""}
                onChange={(event) =>
                  onChange({
                    mode: "new",
                    client: { ...value.client, secondary_contact: event.target.value },
                  })
                }
              />
            </div>
          </div>

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
                    preferred_channel:
                      preferredChannel as typeof value.client.preferred_channel,
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
            <Label htmlFor="client-insights">{bg.projects.wizard.clientInsights}</Label>
            <p className="text-body">{bg.projects.wizard.clientInsightsDescription}</p>
            <Textarea
              id="client-insights"
              className="min-h-40"
              value={value.client.client_insights ?? ""}
              onChange={(event) =>
                onChange({
                  mode: "new",
                  client: { ...value.client, client_insights: event.target.value },
                })
              }
              placeholder={bg.projects.wizard.clientInsightsPlaceholder}
            />
          </div>
        </div>
      )}
    </div>
  );
}
