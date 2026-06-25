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
  return (
    <header className="flex flex-col gap-6">
      <Link
        href="/projects"
        className="text-body transition-colors hover:text-foreground"
      >
        {bg.projects.title}
      </Link>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-display">{workspace.name}</h1>
          <ProjectStatusBadge status={workspace.engagement_status} />
          <Badge variant="outline">
            {bg.projects.workspace.priorityLabel(
              PROJECT_PRIORITY_LABELS[workspace.priority]
            )}
          </Badge>
        </div>

        <p className="text-body">
          {workspace.client_display_name} · {workspace.project_type_label} ·{" "}
          {workspace.site_area_label} · {workspace.target_handover_label}
        </p>
      </div>
    </header>
  );
}
