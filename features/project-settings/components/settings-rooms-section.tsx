"use client";

import { useState, useTransition } from "react";
import { GripVerticalIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  archiveProjectRoomSettingsAction,
  createProjectRoomSettingsAction,
  reorderProjectRoomsSettingsAction,
  updateProjectRoomSettingsAction,
} from "@/features/project-settings/actions/project-settings.actions";
import { SettingsSection } from "@/features/project-settings/components/settings-section";
import { useDebouncedCallback } from "@/features/project-settings/lib/use-debounced-callback";
import type { ProjectSettingsView } from "@/features/project-settings/types/project-settings";
import type { Room } from "@/features/rooms/types/room";
import { bg } from "@/src/i18n/bg";

interface SettingsRoomsSectionProps {
  settings: ProjectSettingsView;
  onRoomsChange: (rooms: Room[]) => void;
}

function reorderRooms(list: Room[], fromIndex: number, toIndex: number): Room[] {
  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next.map((room, index) => ({ ...room, sort_order: index }));
}

export function SettingsRoomsSection({
  settings,
  onRoomsChange,
}: SettingsRoomsSectionProps) {
  const [rooms, setRooms] = useState(settings.rooms);
  const [newRoomName, setNewRoomName] = useState("");
  const [isPending, startTransition] = useTransition();

  const debouncedRename = useDebouncedCallback((roomId: string, name: string) => {
    startTransition(async () => {
      const result = await updateProjectRoomSettingsAction({
        project_id: settings.project.id,
        room_id: roomId,
        name,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(bg.projects.settings.saved, { duration: 1500 });
    });
  }, 400);

  function handleAddRoom() {
    const name = newRoomName.trim();

    if (!name) {
      return;
    }

    startTransition(async () => {
      const result = await createProjectRoomSettingsAction({
        project_id: settings.project.id,
        name,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const nextRooms = [...rooms, result.data];
      setRooms(nextRooms);
      onRoomsChange(nextRooms);
      setNewRoomName("");
      toast.success(bg.projects.settings.saved, { duration: 1500 });
    });
  }

  function handleArchive(roomId: string) {
    startTransition(async () => {
      const result = await archiveProjectRoomSettingsAction({
        project_id: settings.project.id,
        room_id: roomId,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const nextRooms = rooms.filter((room) => room.id !== roomId);
      setRooms(nextRooms);
      onRoomsChange(nextRooms);
      toast.success(bg.projects.settings.saved, { duration: 1500 });
    });
  }

  function handleReorder(fromIndex: number, toIndex: number) {
    const nextRooms = reorderRooms(rooms, fromIndex, toIndex);
    setRooms(nextRooms);
    onRoomsChange(nextRooms);

    startTransition(async () => {
      const result = await reorderProjectRoomsSettingsAction({
        project_id: settings.project.id,
        room_ids: nextRooms.map((room) => room.id),
      });

      if (!result.success) {
        toast.error(result.error);
        setRooms(settings.rooms);
        onRoomsChange(settings.rooms);
        return;
      }

      setRooms(result.data);
      onRoomsChange(result.data);
    });
  }

  return (
    <SettingsSection
      id="settings-rooms"
      title={bg.projects.settings.sections.rooms}
      description={bg.projects.settings.rooms.hint}
    >
      <div className="grid gap-4">
        {rooms.length === 0 ? (
          <p className="text-sm text-muted-foreground">{bg.projects.settings.rooms.empty}</p>
        ) : (
          <ol className="grid gap-2">
            {rooms.map((room, index) => (
              <li
                key={room.id}
                draggable={!isPending}
                onDragStart={(event) => event.dataTransfer.setData("text/plain", room.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const draggedId = event.dataTransfer.getData("text/plain");
                  const fromIndex = rooms.findIndex((entry) => entry.id === draggedId);

                  if (fromIndex >= 0 && fromIndex !== index) {
                    handleReorder(fromIndex, index);
                  }
                }}
                className="flex items-center gap-2 rounded-xl border border-border/50 px-3 py-2"
              >
                <GripVerticalIcon
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-label={bg.projects.settings.rooms.dragHandle}
                />
                <Input
                  value={room.name}
                  disabled={isPending}
                  onChange={(event) => {
                    const name = event.target.value;
                    const nextRooms = rooms.map((entry) =>
                      entry.id === room.id ? { ...entry, name } : entry
                    );
                    setRooms(nextRooms);
                    debouncedRename(room.id, name);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={isPending}
                  onClick={() => handleArchive(room.id)}
                  aria-label={bg.projects.settings.rooms.archive}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </li>
            ))}
          </ol>
        )}

        <div className="flex gap-2">
          <Input
            value={newRoomName}
            disabled={isPending}
            placeholder={bg.projects.settings.rooms.newRoomPlaceholder}
            onChange={(event) => setNewRoomName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAddRoom();
              }
            }}
          />
          <Button type="button" disabled={isPending} onClick={handleAddRoom}>
            <PlusIcon className="size-4" />
            {bg.projects.settings.rooms.add}
          </Button>
        </div>
      </div>
    </SettingsSection>
  );
}
