"use client";

import { WorkflowGroupTimeline } from "@/features/workflow-engine/components/workflow-group-timeline";
import { findActiveWaitingForInstance } from "@/features/workflow-engine/lib/resolve-active-waiting";
import { getWaitingReasonLabel } from "@/features/workflow-engine/lib/waiting-reason-labels";
import type { ProjectWorkflowEngineView, StageWorkData } from "@/features/workflow-engine/types/workflow-engine";
import type { WorkSession } from "@/features/work-sessions/types/work-session";
import { formatLongDate, formatShortDate } from "@/src/i18n/format";
import { bg } from "@/src/i18n/bg";

interface WorkflowEngineGroupsProps {
  projectId: string;
  workflow: ProjectWorkflowEngineView;
  runningSession: WorkSession | null;
  stageWorkData: Record<string, StageWorkData>;
  designDeadlineLabel?: string | null;
}

export function WorkflowEngineGroups({
  projectId,
  workflow,
  runningSession,
  stageWorkData,
  designDeadlineLabel,
}: WorkflowEngineGroupsProps) {
  const currentContext = workflow.current;
  const activeWaiting = findActiveWaitingForInstance(
    stageWorkData,
    currentContext?.instance_id ?? null
  );

  return (
    <div className="grid gap-16">
      {currentContext ? (
        activeWaiting ? (
          <WaitingHero waiting={activeWaiting} />
        ) : (
          <div className="grid gap-2 border-b border-border/40 pb-10">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {bg.workflowEngine.workspaceTimeline.workingOn}
            </p>
            <p className="text-2xl font-semibold tracking-tight">
              {formatCurrentContextLabel(workflow, currentContext)}
            </p>
          </div>
        )
      ) : null}

      {workflow.groups.map((group) => (
        <WorkflowGroupTimeline
          key={group.id}
          projectId={projectId}
          group={group}
          workflow={workflow}
          stageWorkData={stageWorkData}
          runningSession={runningSession}
          designDeadlineLabel={designDeadlineLabel}
        />
      ))}
    </div>
  );
}

function WaitingHero({
  waiting,
}: {
  waiting: NonNullable<ReturnType<typeof findActiveWaitingForInstance>>;
}) {
  const reasonLabel = getWaitingReasonLabel(waiting.reason, waiting.custom_reason);

  return (
    <div className="grid gap-4 border-b border-amber-500/25 pb-10">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {bg.workflowEngine.workspaceTimeline.projectWaiting}
      </p>
      <div className="grid gap-1">
        <p className="text-sm text-muted-foreground">{bg.workflowWaiting.reasonLabel}</p>
        <p className="text-2xl font-semibold tracking-tight">{reasonLabel}</p>
      </div>
      <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
        <div className="grid gap-0.5">
          <dt className="text-muted-foreground">{bg.commandCenter.waiting.from}</dt>
          <dd>{formatLongDate(waiting.started_at)}</dd>
        </div>
        {waiting.expected_end_at ? (
          <div className="grid gap-0.5">
            <dt className="text-muted-foreground">
              {bg.workflowEngine.workspaceTimeline.expectedUntil}
            </dt>
            <dd>{formatShortDate(waiting.expected_end_at)}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

function formatCurrentContextLabel(
  workflow: ProjectWorkflowEngineView,
  context: NonNullable<ProjectWorkflowEngineView["current"]>
) {
  const parts = [context.group_name, context.stage_name];
  const instanceLabel = resolveCurrentInstanceLabel(workflow, context.instance_id);

  if (instanceLabel) {
    parts.push(instanceLabel);
  } else if (context.room_name) {
    parts.push(context.room_name);
  }

  return parts.join(" · ");
}

function resolveCurrentInstanceLabel(
  workflow: ProjectWorkflowEngineView,
  instanceId: string | null
): string | null {
  if (!instanceId) {
    return null;
  }

  for (const group of workflow.groups) {
    for (const stage of group.stages) {
      const instance = stage.instances.find((entry) => entry.id === instanceId);

      if (!instance) {
        continue;
      }

      if (stage.execution_mode === "ROOMS") {
        return instance.room_name;
      }

      if (stage.execution_mode === "DOCUMENTS") {
        return instance.document_item_name;
      }
    }
  }

  return null;
}
