"use client";

import { Progress } from "@/components/ui/progress";
import { WorkflowStageTimelineItem } from "@/features/workflow-engine/components/workflow-stage-timeline-item";
import {
  aggregateGroupWorkMetrics,
  findCurrentStageName,
} from "@/features/workflow-engine/lib/workflow-timeline-metrics";
import type {
  ProjectWorkflowEngineView,
  StageWorkData,
  WorkflowGroupView,
} from "@/features/workflow-engine/types/workflow-engine";
import type { WorkSession } from "@/features/work-sessions/types/work-session";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

interface WorkflowGroupTimelineProps {
  projectId: string;
  group: WorkflowGroupView;
  workflow: ProjectWorkflowEngineView;
  stageWorkData: Record<string, StageWorkData>;
  runningSession: WorkSession | null;
  designDeadlineLabel?: string | null;
}

export function WorkflowGroupTimeline({
  projectId,
  group,
  workflow,
  stageWorkData,
  runningSession,
  designDeadlineLabel,
}: WorkflowGroupTimelineProps) {
  const enabledStages = group.stages.filter((stage) => stage.enabled);
  const metrics = aggregateGroupWorkMetrics(group, stageWorkData);
  const currentStageName = findCurrentStageName(group);
  const currentInstanceId =
    workflow.current?.group_id === group.id ? workflow.current.instance_id : null;

  return (
    <section
      className={cn(
        "grid gap-10",
        group.is_current ? "opacity-100" : "opacity-70"
      )}
    >
      <header className="grid gap-6">
        <div className="grid gap-2">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-lg font-semibold tracking-tight">{group.name}</h3>
            {group.is_current ? (
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {bg.workflowEngine.workspaceTimeline.activeGroup}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-4">
            <Progress value={group.progress_percent} className="h-1 max-w-xs flex-1" />
            <span className="text-sm tabular-nums text-muted-foreground">
              {group.progress_percent}%
            </span>
          </div>
        </div>

        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <MetricItem
            label={bg.workflowEngine.workspaceTimeline.currentStage}
            value={currentStageName ?? bg.workflowEngine.workspaceTimeline.notStarted}
          />
          <MetricItem
            label={bg.workSessionManual.estimatedLabel}
            value={`${formatHours(metrics.estimated_hours)}${bg.common.hoursShort}`}
          />
          <MetricItem
            label={bg.workSessionManual.workedLabel}
            value={`${formatHours(metrics.worked_hours)}${bg.common.hoursShort}`}
          />
          <MetricItem
            label={bg.workSessionManual.remainingLabel}
            value={`${formatHours(metrics.remaining_hours)}${bg.common.hoursShort}`}
          />
          <MetricItem
            label={bg.workflowEngine.workspaceTimeline.deadline}
            value={designDeadlineLabel ?? bg.common.empty}
          />
        </dl>
      </header>

      {enabledStages.length === 0 ? (
        <p className="text-sm text-muted-foreground">{bg.workflowEngine.noStages}</p>
      ) : (
        <div className="grid">
          {enabledStages.map((stage, index) => (
            <WorkflowStageTimelineItem
              key={stage.id}
              projectId={projectId}
              stage={stage}
              workData={stageWorkData[stage.id] ?? null}
              runningSession={runningSession}
              currentInstanceId={currentInstanceId}
              isLast={index === enabledStages.length - 1}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

function formatHours(hours: number): string {
  const rounded = Math.round(hours * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
