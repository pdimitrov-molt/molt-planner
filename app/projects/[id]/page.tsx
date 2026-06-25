import { ProjectWorkspaceView } from "@/features/projects/components/project-workspace-view";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  return <ProjectWorkspaceView projectId={id} />;
}
