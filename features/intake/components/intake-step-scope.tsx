"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { IntakeScopeInput } from "@/features/intake/types/intake-plan";
import type { ProjectType } from "@/features/projects/types/project";
import { getProjectTypeLabel } from "@/features/projects/types/project";
import {
  buildWizardRoomsFromTemplate,
  getRoomTemplateSet,
} from "@/features/rooms/data/room-templates";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

interface IntakeStepScopeProps {
  projectType: ProjectType;
  value: IntakeScopeInput;
  onChange: (value: IntakeScopeInput) => void;
}

export function IntakeStepScope({
  projectType,
  value,
  onChange,
}: IntakeStepScopeProps) {
  const templateSet = getRoomTemplateSet(projectType);

  function switchMode(mode: IntakeScopeInput["mode"]) {
    if (mode === "manual") {
      onChange({
        mode: "manual",
        site_area: value.site_area,
        approximate_room_count: value.approximate_room_count || 3,
        selected_template_room_keys: [],
      });
      return;
    }

    const defaultRooms = buildWizardRoomsFromTemplate(projectType);

    onChange({
      mode: "template",
      site_area: value.site_area,
      approximate_room_count: defaultRooms.length,
      selected_template_room_keys: defaultRooms
        .map((room) => room.room_template_key)
        .filter((key): key is string => key !== null),
    });
  }

  function toggleTemplateRoom(roomKey: string, checked: boolean) {
    if (value.mode !== "template") {
      return;
    }

    const nextKeys = checked
      ? [...value.selected_template_room_keys, roomKey]
      : value.selected_template_room_keys.filter((key) => key !== roomKey);

    onChange({
      ...value,
      selected_template_room_keys: nextKeys,
      approximate_room_count: Math.max(nextKeys.length, 1),
    });
  }

  return (
    <div className="grid gap-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          className={cn(
            "surface-selectable text-left",
            value.mode === "manual" && "surface-selectable-selected"
          )}
          onClick={() => switchMode("manual")}
        >
          <p className="font-medium">{bg.intake.scope.manual}</p>
          <p className="text-sm text-muted-foreground">{bg.intake.scope.manualHint}</p>
        </button>
        <button
          type="button"
          className={cn(
            "surface-selectable text-left",
            value.mode === "template" && "surface-selectable-selected"
          )}
          onClick={() => switchMode("template")}
        >
          <p className="font-medium">{bg.intake.scope.template}</p>
          <p className="text-sm text-muted-foreground">
            {bg.intake.scope.templateHint(getProjectTypeLabel(projectType))}
          </p>
        </button>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="intake-site-area">{bg.intake.scope.siteArea}</Label>
        <Input
          id="intake-site-area"
          type="number"
          min="0"
          step="0.1"
          value={value.site_area ?? ""}
          onChange={(event) =>
            onChange({
              ...value,
              site_area:
                event.target.value === "" ? null : Number(event.target.value),
            })
          }
          placeholder={bg.projects.wizard.siteAreaPlaceholder}
        />
      </div>

      {value.mode === "manual" ? (
        <div className="grid gap-2">
          <Label htmlFor="intake-room-count">{bg.intake.scope.roomCount}</Label>
          <Input
            id="intake-room-count"
            type="number"
            min="1"
            max="50"
            value={value.approximate_room_count}
            onChange={(event) =>
              onChange({
                ...value,
                approximate_room_count: Number(event.target.value) || 1,
              })
            }
          />
          <p className="text-sm text-muted-foreground">
            {bg.intake.scope.roomCountHint}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          <Label>{templateSet?.name ?? bg.intake.scope.templateRooms}</Label>
          {templateSet ? (
            templateSet.rooms.map((templateRoom) => {
              const isSelected = value.selected_template_room_keys.includes(
                templateRoom.key
              );

              return (
                <label
                  key={templateRoom.key}
                  className="surface-panel flex items-start gap-3"
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      toggleTemplateRoom(templateRoom.key, checked === true)
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
            })
          ) : (
            <p className="surface-panel border-dashed p-8 text-body">
              {bg.intake.scope.noTemplate}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
