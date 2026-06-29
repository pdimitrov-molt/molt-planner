import "server-only";

import type { ProjectWithClient } from "@/features/projects/types/project";
import type { PausedWorkflowSession } from "@/features/planning-engine/lib/build-dashboard-priorities";
import { findWorkSessionsByPhaseId } from "@/features/work-sessions/service/cached-work-session-queries";
import type {
  ProjectWorkflowEngineView,
  WorkflowStageInstanceView,
  WorkflowStageView,
} from "@/features/workflow-engine/types/workflow-engine";

function resolveInstanceName(
  instance: WorkflowStageInstanceView,
  executionMode: WorkflowStageView["execution_mode"]
): string | null {
  if (executionMode === "ROOMS") {
    return instance.room_name ?? instance.room_id;
  }

  if (executionMode === "DOCUMENTS") {
    return (
      instance.document_item_name ??
      instance.document_item_key ??
      instance.document_item_name
    );
  }

  return null;
}

export async function collectPausedWorkflowSessions(input: {
  projects: ProjectWithClient[];
  workflows: Map<string, ProjectWorkflowEngineView>;
}): Promise<PausedWorkflowSession[]> {
  const pausedSessions: PausedWorkflowSession[] = [];
  const seenPhaseIds = new Set<string>();

  await Promise.all(
    input.projects.map(async (project) => {
      const workflow = input.workflows.get(project.id);

      if (!workflow) {
        return;
      }

      await Promise.all(
        workflow.groups.flatMap((group) =>
          group.stages.flatMap((stage) =>
            stage.instances.map(async (instance) => {
              if (!instance.timer_target_id || seenPhaseIds.has(instance.timer_target_id)) {
                return;
              }

              seenPhaseIds.add(instance.timer_target_id);

              const sessions = await findWorkSessionsByPhaseId(instance.timer_target_id);
              const pausedSession = sessions.find(
                (session) => session.status === "paused"
              );

              if (!pausedSession) {
                return;
              }

              pausedSessions.push({
                session_id: pausedSession.id,
                project_id: project.id,
                project_name: project.name,
                group_name: group.name,
                stage_name: stage.name,
                instance_name: resolveInstanceName(instance, stage.execution_mode),
                phase_id: instance.timer_target_id,
              });
            })
          )
        )
      );
    })
  );

  return pausedSessions;
}
