"use client";

import { GripVerticalIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createDocumentItem,
  normalizeDocumentItems,
} from "@/features/project-settings/lib/stage-settings-helpers";
import type { WorkflowDocumentItemDefinition } from "@/features/workflow-engine/types/workflow-engine";
import { bg } from "@/src/i18n/bg";

interface SettingsStageDocumentItemsProps {
  items: WorkflowDocumentItemDefinition[];
  disabled?: boolean;
  onChange: (items: WorkflowDocumentItemDefinition[]) => void;
}

function reorder<T>(list: T[], fromIndex: number, toIndex: number): T[] {
  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function SettingsStageDocumentItems({
  items,
  disabled = false,
  onChange,
}: SettingsStageDocumentItemsProps) {
  function updateItem(
    itemId: string,
    patch: Partial<WorkflowDocumentItemDefinition>
  ) {
    onChange(
      normalizeDocumentItems(
        items.map((item) => (item.id === itemId ? { ...item, ...patch } : item))
      )
    );
  }

  function addItem() {
    onChange(
      normalizeDocumentItems([
        ...items,
        createDocumentItem({
          name: bg.workflowEngine.settings.newDocumentItem,
          sort_order: items.length,
        }),
      ])
    );
  }

  function removeItem(itemId: string) {
    onChange(normalizeDocumentItems(items.filter((item) => item.id !== itemId)));
  }

  return (
    <div className="grid gap-2 border-t border-border/40 pt-3">
      <Label className="text-xs text-muted-foreground">
        {bg.workflowEngine.settings.documentItems}
      </Label>

      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {bg.workflowEngine.settings.documentItemsEmpty}
        </p>
      ) : (
        <ol className="grid gap-2">
          {items.map((item, index) => (
            <li
              key={item.id}
              draggable={!disabled}
              onDragStart={(event) => {
                event.dataTransfer.setData("text/plain", item.id);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const dragId = event.dataTransfer.getData("text/plain");
                const fromIndex = items.findIndex((entry) => entry.id === dragId);

                if (fromIndex >= 0 && fromIndex !== index) {
                  onChange(normalizeDocumentItems(reorder(items, fromIndex, index)));
                }
              }}
              className="flex items-center gap-2 rounded-lg border border-border/50 px-2 py-1.5"
            >
              <GripVerticalIcon className="size-4 shrink-0 cursor-grab text-muted-foreground" />
              <Input
                value={item.name}
                disabled={disabled}
                onChange={(event) =>
                  updateItem(item.id, { name: event.target.value })
                }
                className="h-8"
              />
              <Checkbox
                checked={item.enabled}
                disabled={disabled}
                onCheckedChange={(checked) =>
                  updateItem(item.id, { enabled: checked === true })
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                disabled={disabled || items.length <= 1}
                onClick={() => removeItem(item.id)}
              >
                <Trash2Icon className="size-4" />
              </Button>
            </li>
          ))}
        </ol>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        disabled={disabled}
        onClick={addItem}
      >
        <PlusIcon className="size-4" />
        {bg.workflowEngine.settings.addDocumentItem}
      </Button>
    </div>
  );
}
