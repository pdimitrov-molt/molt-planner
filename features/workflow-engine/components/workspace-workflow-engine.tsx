import { getWorkSessionService } from "@/features/work-sessions/service/get-work-session-service";
import { loadStageWorkData } from "@/features/workflow-engine/lib/load-stage-work-data";
import { getProjectWorkflowEngineView } from "@/features/workflow-engine/service/get-workflow-engine";
import { getWorkflowWaitingService } from "@/features/workflow-engine/service/get-workflow-waiting-service";
import { WorkflowEngineGroups } from "@/features/workflow-engine/components/workflow-engine-groups";
import type {
  ProjectWorkflowEngineView,
  StageWorkData,
} from "@/features/workflow-engine/types/workflow-engine";
import { bg } from "@/src/i18n/bg";

interface WorkspaceWorkflowEngineProps {
  projectId: string;
  designDeadlineLabel?: string | null;
  workflow?: ProjectWorkflowEngineView | null;
}

export async function WorkspaceWorkflowEngine({
  projectId,
  designDeadlineLabel,
  workflow: workflowFromParent,
}: WorkspaceWorkflowEngineProps) {
  const [workflow, workSessionService, waitingService] = await Promise.all([
    workflowFromParent !== undefined
      ? Promise.resolve(workflowFromParent)
      : getProjectWorkflowEngineView(projectId),
    getWorkSessionService(),
    getWorkflowWaitingService(),
  ]);

  if (!workflow) {
    return null;
  }

  const [runningSession, stageWorkDataEntries] = await Promise.all([
    workSessionService.findRunningSession(),
    Promise.all(
      workflow.groups.flatMap((group) =>
        group.stages.map(async (stage) => {
          const data = await loadStageWorkData(stage, workSessionService, waitingService);
          return [stage.id, data] as const;
        })
      )
    ),
  ]);

  const stageWorkData = Object.fromEntries(stageWorkDataEntries) as Record<
    string,
    StageWorkData
  >;

  return (
    <section className="flex flex-col gap-6">
      <div className="grid gap-1">
        <h2 className="text-title">{bg.workflowEngine.workspaceTitle}</h2>
        <p className="text-sm text-muted-foreground">
          {bg.workflowEngine.workspaceSubtitle}
        </p>
      </div>

      <WorkflowEngineGroups
        projectId={projectId}
        workflow={workflow}
        runningSession={runningSession}
        stageWorkData={stageWorkData}
        designDeadlineLabel={designDeadlineLabel}
      />
    </section>
  );
}
