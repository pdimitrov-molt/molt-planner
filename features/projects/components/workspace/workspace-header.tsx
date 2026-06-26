import Link from "next/link";

import { ProjectStatusBadge } from "@/features/projects/components/project-status-badge";
import { PROJECT_PRIORITY_LABELS } from "@/features/projects/types/project";
import type { ProjectWorkspace } from "@/features/projects/types/project-workspace";
import { Badge } from "@/components/ui/badge";
import { bg } from "@/src/i18n/bg";

interface WorkspaceHeaderProps {
  workspace: ProjectWorkspace;
}

export function WorkspaceHeader({ workspace }: WorkspaceHeaderProps) {
  const isCompleted =
    workspace.is_completed || workspace.engagement_status === "completed";

  return (
    <header className="flex flex-col gap-8">
      <Link
        href="/projects"
        className="text-body transition-colors hover:text-foreground"
      >
        {bg.projects.title}
      </Link>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-eyebrow">{workspace.project_number}</p>
          {isCompleted ? (
            <Badge className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm text-white hover:bg-emerald-600">
              {bg.progress.projectCompleted}
            </Badge>
          ) : (
            <ProjectStatusBadge status={workspace.engagement_status} />
          )}
          <Badge variant="outline">
            {bg.projects.workspace.priorityLabel(
              PROJECT_PRIORITY_LABELS[workspace.priority]
            )}
          </Badge>
        </div>

        <h1 className="text-display">{workspace.name}</h1>

        <p className="max-w-3xl text-body">
          {workspace.client_display_name} · {workspace.classification_label} ·{" "}
          {workspace.site_area_label}
        </p>

        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <span>
            {bg.projects.wizard.designDeadline}: {workspace.design_deadline_label}
          </span>
          <span>
            {bg.projects.wizard.executionDeadline}:{" "}
            {workspace.execution_deadline_label}
          </span>
          <span>
            {bg.projects.wizard.moveInDate}: {workspace.move_in_date_label}
          </span>
        </div>
      </div>
    </header>
  );
}
