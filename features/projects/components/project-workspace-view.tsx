import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { getProjectWorkspaceService } from "@/features/projects/service/project-workspace.service";
import { WorkspaceContext } from "@/features/projects/components/workspace/workspace-context";
import { WorkspaceHeader } from "@/features/projects/components/workspace/workspace-header";
import { WorkspaceProgressHero } from "@/features/projects/components/workspace/workspace-progress-hero";
import { WorkspaceRoomWorkflow } from "@/features/projects/components/workspace/workspace-room-workflow";

interface ProjectWorkspaceViewProps {
  projectId: string;
}

export async function ProjectWorkspaceView({ projectId }: ProjectWorkspaceViewProps) {
  const service = await getProjectWorkspaceService();
  const workspace = await service.getProjectWorkspace(projectId);

  if (!workspace) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <PageShell width="lg">
        <div className="flex flex-col gap-12">
        <WorkspaceHeader workspace={workspace} />

        <WorkspaceProgressHero workspace={workspace} />

        <WorkspaceRoomWorkflow projectId={projectId} workspace={workspace} />

        <WorkspaceContext workspace={workspace} />
        </div>
      </PageShell>
    </main>
  );
}
