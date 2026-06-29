"use client";

import { GripVerticalIcon, PlusIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

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
import { updateProjectWorkflowGroupsAction } from "@/features/project-settings/actions/project-settings.actions";
import { SettingsSection } from "@/features/project-settings/components/settings-section";
import { SettingsStageDocumentItems } from "@/features/project-settings/components/settings-stage-document-items";
import { useDebouncedCallback } from "@/features/project-settings/lib/use-debounced-callback";
import {
  applyStageExecutionModePatch,
  normalizeDocumentItems,
} from "@/features/project-settings/lib/stage-settings-helpers";
import type {
  WorkflowGroupDefinition,
  WorkflowGroupScope,
  WorkflowStageDefinition,
  WorkflowStageExecutionMode,
} from "@/features/workflow-engine/types/workflow-engine";
import { WORKFLOW_STAGE_EXECUTION_MODES } from "@/features/workflow-engine/types/workflow-engine";
import { recalculateGroupHours } from "@/features/workflow-engine/lib/recalculate-group-hours";
import { createId } from "@/lib/create-id";
import {
  executionModeForGroupScope,
  itemTypeFromExecutionMode,
} from "@/features/workflow-engine/lib/workflow-execution-mode";
import { normalizeStageDefinition } from "@/features/workflow-engine/lib/workflow-scope";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

interface SettingsWorkflowGroupsSectionProps {
  projectId: string;
  groups: WorkflowGroupDefinition[];
  rooms: Array<{ id: string; name: string }>;
  onGroupsChange: (groups: WorkflowGroupDefinition[]) => void;
}

function reorder<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

const EXECUTION_MODE_LABELS: Record<WorkflowStageExecutionMode, string> = {
  PROJECT: bg.workflowEngine.settings.executionModeProject,
  ROOMS: bg.workflowEngine.settings.executionModeRooms,
  DOCUMENTS: bg.workflowEngine.settings.executionModeDocuments,
};

function stageDefaultsForGroup(scope: WorkflowGroupScope) {
  const execution_mode = executionModeForGroupScope(scope);

  return {
    execution_mode,
    item_type: itemTypeFromExecutionMode(execution_mode),
    room_ids: [] as string[],
  };
}

export function SettingsWorkflowGroupsSection({
  projectId,
  groups,
  rooms,
  onGroupsChange,
}: SettingsWorkflowGroupsSectionProps) {
  const [dragTarget, setDragTarget] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function persist(nextGroups: WorkflowGroupDefinition[]) {
    const normalized = nextGroups.map(recalculateGroupHours).map((group, index) => ({
      ...group,
      sort_order: index,
      stages: group.stages.map((stage, stageIndex) => {
        const normalized = normalizeStageDefinition(
          {
            ...stage,
            sort_order: stageIndex,
            document_items: stage.document_items
              ? normalizeDocumentItems(stage.document_items)
              : stage.document_items,
          },
          group.scope
        );

        return normalized;
      }),
    }));

    onGroupsChange(normalized);

    startTransition(async () => {
      const result = await updateProjectWorkflowGroupsAction({
        project_id: projectId,
        groups: normalized,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      onGroupsChange(result.data);
      toast.success(bg.projects.settings.saved, { duration: 1500 });
    });
  }

  const debouncedPersist = useDebouncedCallback(persist, 400);

  function updateGroups(updater: (current: WorkflowGroupDefinition[]) => WorkflowGroupDefinition[]) {
    persist(updater(groups));
  }

  function updateGroup(
    groupId: string,
    patch: Partial<WorkflowGroupDefinition>,
    debounced = false
  ) {
    const next = groups.map((group) => {
      if (group.id !== groupId) {
        return group;
      }

      const updated = recalculateGroupHours({ ...group, ...patch });

      if (patch.scope) {
        return {
          ...updated,
          room_ids: patch.scope === "PROJECT" ? [] : updated.room_ids,
        };
      }

      return updated;
    });

    if (debounced) {
      onGroupsChange(next);
      debouncedPersist(next);
      return;
    }

    persist(next);
  }

  function updateStage(
    groupId: string,
    stageId: string,
    patch: Partial<WorkflowStageDefinition>,
    debounced = false
  ) {
    const next = groups.map((group) => {
      if (group.id !== groupId) {
        return group;
      }

      return recalculateGroupHours({
        ...group,
        stages: group.stages.map((stage) =>
          stage.id === stageId ? { ...stage, ...patch } : stage
        ),
      });
    });

    if (debounced) {
      onGroupsChange(next);
      debouncedPersist(next);
      return;
    }

    persist(next);
  }

  function addGroup() {
    const group: WorkflowGroupDefinition = {
      id: createId(),
      key: `group_${groups.length + 1}`,
      name: bg.workflowEngine.settings.newGroup,
      sort_order: groups.length,
      estimated_hours: 0,
      enabled: true,
      scope: "PROJECT",
      room_ids: [],
      stages: [
        {
          id: createId(),
          key: "new_stage",
          name: bg.workflowEngine.settings.newStage,
          sort_order: 0,
          estimated_hours: 8,
          enabled: true,
          ...stageDefaultsForGroup("PROJECT"),
          legacy_phase_kind: null,
        },
      ],
    };

    persist([...groups, group]);
  }

  function addStage(groupId: string) {
    updateGroups((current) =>
      current.map((group) => {
        if (group.id !== groupId) {
          return group;
        }

        return recalculateGroupHours({
          ...group,
          stages: [
            ...group.stages,
            {
              id: createId(),
              key: `stage_${group.stages.length + 1}`,
              name: bg.workflowEngine.settings.newStage,
              sort_order: group.stages.length,
              estimated_hours: 8,
              enabled: true,
              ...stageDefaultsForGroup(group.scope),
              legacy_phase_kind: null,
            },
          ],
        });
      })
    );
  }

  return (
    <SettingsSection
      id="settings-workflow"
      title={bg.projects.settings.sections.workflow}
      description={bg.workflowEngine.settings.editorHint}
    >
      <div className="grid gap-4">
        {groups.map((group, groupIndex) => (
          <article
            key={group.id}
            draggable
            onDragStart={() => setDragTarget(`group:${group.id}`)}
            onDragEnd={() => setDragTarget(null)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (!dragTarget?.startsWith("group:")) {
                return;
              }

              const dragGroupId = dragTarget.replace("group:", "");
              const fromIndex = groups.findIndex((entry) => entry.id === dragGroupId);

              if (fromIndex >= 0) {
                persist(reorder(groups, fromIndex, groupIndex).map(recalculateGroupHours));
              }

              setDragTarget(null);
            }}
            className={cn(
              "rounded-2xl border border-border/60 bg-background p-4",
              !group.enabled && "opacity-70"
            )}
          >
            <div className="mb-4 flex items-start gap-3">
              <GripVerticalIcon className="mt-2 size-4 shrink-0 cursor-grab text-muted-foreground" />
              <div className="grid min-w-0 flex-1 gap-3">
                <Input
                  value={group.name}
                  disabled={isPending}
                  onChange={(event) =>
                    updateGroup(group.id, { name: event.target.value }, true)
                  }
                />
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={group.enabled}
                      disabled={isPending}
                      onCheckedChange={(checked) =>
                        updateGroup(group.id, { enabled: checked === true })
                      }
                    />
                    <Label className="text-sm font-normal">
                      {bg.workflowEngine.settings.groupEnabled}
                    </Label>
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs text-muted-foreground">
                      {bg.workflowEngine.settings.groupScope}
                    </Label>
                    <Select
                      value={group.scope}
                      onValueChange={(value: WorkflowGroupScope) =>
                        updateGroup(group.id, { scope: value })
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-[220px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PROJECT">
                          {bg.workflowEngine.settings.projectGroup}
                        </SelectItem>
                        <SelectItem value="ROOM">
                          {bg.workflowEngine.settings.roomGroup}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {group.estimated_hours}
                    {bg.common.hoursShort}
                  </p>
                </div>
                {group.scope === "ROOM" && rooms.length > 0 ? (
                  <div className="grid gap-2 border-t border-border/40 pt-3">
                    <Label className="text-xs text-muted-foreground">
                      {bg.workflowEngine.settings.assignedRooms}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {rooms.map((room) => {
                        const selected = group.room_ids.includes(room.id);

                        return (
                          <label
                            key={room.id}
                            className="flex items-center gap-2 rounded-lg border border-border/50 px-2 py-1 text-xs"
                          >
                            <Checkbox
                              checked={selected}
                              disabled={isPending}
                              onCheckedChange={(checked) => {
                                const room_ids = checked
                                  ? [...group.room_ids, room.id]
                                  : group.room_ids.filter((id) => id !== room.id);

                                updateGroup(group.id, { room_ids });
                              }}
                            />
                            {room.name}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid gap-2 pl-7">
              <div className="hidden gap-3 px-3 text-xs text-muted-foreground sm:grid sm:grid-cols-[auto_1fr_7rem_11rem_5rem]">
                <span />
                <span>{bg.projects.settings.stageName}</span>
                <span>{bg.projects.settings.stageHours}</span>
                <span>{bg.workflowEngine.settings.executionMode}</span>
                <span>{bg.projects.settings.stageEnabled}</span>
              </div>

              {group.stages.map((stage, stageIndex) => (
                <div
                  key={stage.id}
                  draggable
                  onDragStart={() => setDragTarget(`stage:${group.id}:${stage.id}`)}
                  onDrop={() => {
                    if (!dragTarget?.startsWith(`stage:${group.id}:`)) {
                      return;
                    }

                    const dragStageId = dragTarget.split(":")[2];
                    const fromIndex = group.stages.findIndex(
                      (entry) => entry.id === dragStageId
                    );

                    if (fromIndex >= 0) {
                      const reordered = reorder(group.stages, fromIndex, stageIndex);
                      updateGroup(group.id, { stages: reordered });
                    }

                    setDragTarget(null);
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  className="grid gap-3 rounded-xl border border-border/50 p-3"
                >
                  <div className="grid gap-3 sm:grid-cols-[auto_1fr_7rem_11rem_5rem]">
                    <GripVerticalIcon className="size-4 cursor-grab self-center text-muted-foreground" />
                    <Input
                      value={stage.name}
                      disabled={isPending}
                      onChange={(event) =>
                        updateStage(group.id, stage.id, { name: event.target.value }, true)
                      }
                    />
                    <Input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={stage.estimated_hours}
                      disabled={isPending}
                      onChange={(event) =>
                        updateStage(
                          group.id,
                          stage.id,
                          { estimated_hours: Number(event.target.value) || 0.5 },
                          true
                        )
                      }
                    />
                    <Select
                      value={stage.execution_mode}
                      onValueChange={(value: WorkflowStageExecutionMode) =>
                        updateStage(group.id, stage.id, {
                          ...applyStageExecutionModePatch(
                            stage,
                            value,
                            bg.workflowEngine.settings.newDocumentItem
                          ),
                        })
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WORKFLOW_STAGE_EXECUTION_MODES.map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {EXECUTION_MODE_LABELS[mode]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Checkbox
                      checked={stage.enabled}
                      disabled={isPending}
                      className="self-center justify-self-start"
                      onCheckedChange={(checked) =>
                        updateStage(group.id, stage.id, { enabled: checked === true })
                      }
                    />
                  </div>

                  {stage.execution_mode === "DOCUMENTS" ? (
                    <SettingsStageDocumentItems
                      items={stage.document_items ?? []}
                      disabled={isPending}
                      onChange={(document_items) =>
                        updateStage(
                          group.id,
                          stage.id,
                          { document_items: normalizeDocumentItems(document_items) },
                          true
                        )
                      }
                    />
                  ) : null}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => addStage(group.id)}
                disabled={isPending}
              >
                <PlusIcon className="size-4" />
                {bg.workflowEngine.settings.addStage}
              </Button>
            </div>
          </article>
        ))}

        <Button type="button" variant="secondary" onClick={addGroup} disabled={isPending}>
          <PlusIcon className="size-4" />
          {bg.workflowEngine.settings.addGroup}
        </Button>
      </div>
    </SettingsSection>
  );
}
