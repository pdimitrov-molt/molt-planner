"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CopyIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

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
import type { ProjectCategory } from "@/features/projects/types/project";
import { getProjectCategoryLabel } from "@/features/projects/types/project";
import {
  buildWizardRoomsFromTemplate,
  getRoomTemplateSet,
} from "@/features/rooms/data/room-templates";
import type { WizardRoomDraft } from "@/features/rooms/types/room-template";
import {
  ROOM_KINDS,
  ROOM_KIND_LABELS,
} from "@/features/rooms/types/room";
import { bg } from "@/src/i18n/bg";

interface WizardStepRoomsProps {
  category: ProjectCategory;
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

function reindexRooms(rooms: WizardRoomDraft[]): WizardRoomDraft[] {
  return rooms.map((room, index) => ({ ...room, sort_order: index }));
}

export function WizardStepRooms({
  category,
  rooms,
  onChange,
}: WizardStepRoomsProps) {
  const templateSet = getRoomTemplateSet(category);

  function toggleRoom(roomKey: string, checked: boolean) {
    if (checked) {
      const templateRoom = templateSet?.rooms.find((room) => room.key === roomKey);

      if (!templateRoom) {
        return;
      }

      onChange(
        reindexRooms([
          ...rooms,
          {
            key: `${templateRoom.key}-${rooms.length}`,
            name: templateRoom.default_name,
            room_kind: templateRoom.room_kind,
            scope_summary: templateRoom.scope_summary,
            room_template_key: templateRoom.key,
            sort_order: rooms.length,
          },
        ])
      );
      return;
    }

    onChange(
      reindexRooms(rooms.filter((room) => room.room_template_key !== roomKey))
    );
  }

  function updateRoom(roomKey: string, patch: Partial<WizardRoomDraft>) {
    onChange(
      rooms.map((room) => (room.key === roomKey ? { ...room, ...patch } : room))
    );
  }

  function removeRoom(roomKey: string) {
    onChange(reindexRooms(rooms.filter((room) => room.key !== roomKey)));
  }

  function duplicateRoom(roomKey: string) {
    const index = rooms.findIndex((room) => room.key === roomKey);

    if (index === -1) {
      return;
    }

    const source = rooms[index];
    const duplicate: WizardRoomDraft = {
      ...source,
      key: `${source.key}-copy-${crypto.randomUUID()}`,
      name: source.name ? `${source.name} (${bg.projects.wizard.duplicateRoom})` : "",
      room_template_key: null,
      sort_order: index + 1,
    };

    const next = [...rooms];
    next.splice(index + 1, 0, duplicate);
    onChange(reindexRooms(next));
  }

  function moveRoom(roomKey: string, direction: "up" | "down") {
    const index = rooms.findIndex((room) => room.key === roomKey);

    if (index === -1) {
      return;
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= rooms.length) {
      return;
    }

    const next = [...rooms];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    onChange(reindexRooms(next));
  }

  function addRoom() {
    onChange(reindexRooms([...rooms, createCustomRoom(rooms.length)]));
  }

  function resetFromTemplate() {
    onChange(buildWizardRoomsFromTemplate(category));
  }

  return (
    <div className="grid gap-8">
      <div className="surface-panel rounded-2xl p-6 shadow-sm">
        <p className="text-section-title">
          {templateSet?.name ?? bg.common.roomTemplateFallback}
        </p>
        <p className="text-body">
          {templateSet?.description ??
            bg.projects.wizard.defaultRoomsFor(getProjectCategoryLabel(category))}
        </p>
        <div className="mt-5">
          <Button type="button" variant="outline" size="sm" onClick={resetFromTemplate}>
            {bg.projects.wizard.loadTemplateDefaults}
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
                className="surface-panel flex items-start gap-3 rounded-2xl shadow-sm"
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
          <p className="surface-panel rounded-2xl border-dashed p-8 text-body shadow-sm">
            {bg.projects.wizard.selectRoomToContinue}
          </p>
        ) : (
          rooms.map((room, index) => (
            <div
              key={room.key}
              className="surface-card grid gap-5 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-medium">
                  {room.room_template_key
                    ? bg.projects.wizard.templateRoom
                    : bg.projects.wizard.customRoom}
                </p>
                <div className="flex flex-wrap items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => duplicateRoom(room.key)}
                  >
                    <CopyIcon data-icon="inline-start" />
                    {bg.projects.wizard.duplicateRoom}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => moveRoom(room.key, "up")}
                  >
                    <ArrowUpIcon data-icon="inline-start" />
                    {bg.projects.wizard.moveRoomUp}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={index === rooms.length - 1}
                    onClick={() => moveRoom(room.key, "down")}
                  >
                    <ArrowDownIcon data-icon="inline-start" />
                    {bg.projects.wizard.moveRoomDown}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRoom(room.key)}
                  >
                    <Trash2Icon data-icon="inline-start" />
                    {bg.projects.wizard.deleteRoom}
                  </Button>
                </div>
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

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-14 w-full rounded-2xl text-base"
          onClick={addRoom}
        >
          <PlusIcon data-icon="inline-start" />
          {bg.projects.wizard.addRoom}
        </Button>
      </div>
    </div>
  );
}
