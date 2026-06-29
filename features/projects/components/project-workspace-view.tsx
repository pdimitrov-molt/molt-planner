import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { getProjectWorkspace } from "@/features/projects/service/project-workspace.service";
import { WorkspaceContext } from "@/features/projects/components/workspace/workspace-context";
import { WorkspaceHeader } from "@/features/projects/components/workspace/workspace-header";
import { WorkspaceProgressHero } from "@/features/projects/components/workspace/workspace-progress-hero";
import { WorkspaceWorkflowEngine } from "@/features/workflow-engine/components/workspace-workflow-engine";
import { getProjectWorkflowEngineView } from "@/features/workflow-engine/service/get-workflow-engine";

interface ProjectWorkspaceViewProps {
  projectId: string;
}

export async function ProjectWorkspaceView({ projectId }: ProjectWorkspaceViewProps) {
  const [workspace, workflow] = await Promise.all([
    getProjectWorkspace(projectId),
    getProjectWorkflowEngineView(projectId),
  ]);

  if (!workspace) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <PageShell width="lg">
        <div className="flex flex-col gap-12">
        <WorkspaceHeader workspace={workspace} />

        <WorkspaceProgressHero
          workspace={workspace}
          workflowProgress={workflow?.progress_percent}
        />

        <WorkspaceWorkflowEngine
          projectId={projectId}
          designDeadlineLabel={workspace.design_deadline_label}
          workflow={workflow}
        />

        <WorkspaceContext workspace={workspace} />
        </div>
      </PageShell>
    </main>
  );
}
