"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  buildWizardRoomsFromTemplate,
  getRoomTemplateSet,
} from "@/features/rooms/data/room-templates";
import type { WizardRoomDraft } from "@/features/rooms/types/room-template";
import {
  ROOM_KINDS,
  ROOM_KIND_LABELS,
} from "@/features/rooms/types/room";
import type { ProjectType } from "@/features/projects/types/project";
import { getProjectTypeLabel } from "@/features/projects/types/project";
import { bg } from "@/src/i18n/bg";

interface WizardStepRoomsProps {
  projectType: ProjectType;
  rooms: WizardRoomDraft[];
  onChange: (rooms: WizardRoomDraft[]) => void;
}

function createCustomRoom(sortOrder: number): WizardRoomDraft {
  return {
    key: `custom-${crypto.randomUUID()}`,
    name: "",
    room_kind: "other",
    scope_summary: "",
    room_template_key: null,
    sort_order: sortOrder,
  };
}

export function WizardStepRooms({
  projectType,
  rooms,
  onChange,
}: WizardStepRoomsProps) {
  const templateSet = getRoomTemplateSet(projectType);

  function toggleRoom(roomKey: string, checked: boolean) {
    if (checked) {
      const templateRoom = templateSet?.rooms.find((room) => room.key === roomKey);

      if (!templateRoom) {
        return;
      }

      onChange([
        ...rooms,
        {
          key: `${templateRoom.key}-${rooms.length}`,
          name: templateRoom.default_name,
          room_kind: templateRoom.room_kind,
          scope_summary: templateRoom.scope_summary,
          room_template_key: templateRoom.key,
          sort_order: rooms.length,
        },
      ]);
      return;
    }

    onChange(
      rooms
        .filter((room) => room.room_template_key !== roomKey)
        .map((room, index) => ({ ...room, sort_order: index }))
    );
  }

  function updateRoom(roomKey: string, patch: Partial<WizardRoomDraft>) {
    onChange(
      rooms.map((room) => (room.key === roomKey ? { ...room, ...patch } : room))
    );
  }

  function removeRoom(roomKey: string) {
    onChange(
      rooms
        .filter((room) => room.key !== roomKey)
        .map((room, index) => ({ ...room, sort_order: index }))
    );
  }

  function resetFromTemplate() {
    onChange(buildWizardRoomsFromTemplate(projectType));
  }

  return (
    <div className="grid gap-8">
      <div className="surface-panel p-6">
        <p className="text-section-title">
          {templateSet?.name ?? bg.common.roomTemplateFallback}
        </p>
        <p className="text-sm text-muted-foreground">
          {templateSet?.description ??
            bg.projects.wizard.defaultRoomsFor(getProjectTypeLabel(projectType))}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button type="button" variant="outline" size="sm" onClick={resetFromTemplate}>
            {bg.projects.wizard.loadTemplateDefaults}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange([...rooms, createCustomRoom(rooms.length)])}
          >
            <PlusIcon data-icon="inline-start" />
            {bg.projects.wizard.addCustomRoom}
          </Button>
        </div>
      </div>

      {templateSet ? (
        <div className="grid gap-4">
          <Label>{bg.projects.wizard.templateRooms}</Label>
          {templateSet.rooms.map((templateRoom) => {
            const isSelected = rooms.some(
              (room) => room.room_template_key === templateRoom.key
            );

            return (
              <label
                key={templateRoom.key}
                className="surface-panel flex items-start gap-3"
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    toggleRoom(templateRoom.key, checked === true)
                  }
                />
                <div>
                  <p className="font-medium">{templateRoom.default_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {templateRoom.scope_summary}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      ) : null}

      <div className="grid gap-5">
        <Label>{bg.projects.wizard.selectedRooms(rooms.length)}</Label>
        {rooms.length === 0 ? (
          <p className="surface-panel border-dashed p-8 text-body">
            {bg.projects.wizard.selectRoomToContinue}
          </p>
        ) : (
          rooms.map((room) => (
            <div key={room.key} className="surface-card grid gap-5 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">
                  {room.room_template_key
                    ? bg.projects.wizard.templateRoom
                    : bg.projects.wizard.customRoom}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeRoom(room.key)}
                >
                  <Trash2Icon />
                  <span className="sr-only">{bg.projects.wizard.removeRoom}</span>
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>{bg.projects.wizard.roomName}</Label>
                  <Input
                    value={room.name}
                    onChange={(event) =>
                      updateRoom(room.key, { name: event.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{bg.projects.wizard.roomType}</Label>
                  <Select
                    value={room.room_kind}
                    onValueChange={(roomKind) =>
                      updateRoom(room.key, {
                        room_kind: roomKind as WizardRoomDraft["room_kind"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOM_KINDS.map((roomKind) => (
                        <SelectItem key={roomKind} value={roomKind}>
                          {ROOM_KIND_LABELS[roomKind]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
