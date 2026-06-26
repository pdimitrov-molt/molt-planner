import Link from "next/link";
import { FolderKanbanIcon } from "lucide-react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NewProjectLink } from "@/features/projects/components/new-project-link";
import { ProjectStatusBadge } from "@/features/projects/components/project-status-badge";
import { ProjectTableRowActions } from "@/features/projects/components/project-table-row-actions";
import type { ProjectWithClient } from "@/features/projects/types/project";
import { getProjectClassificationLabel } from "@/features/projects/types/project";
import { bg } from "@/src/i18n/bg";
import { formatArea, formatShortDate } from "@/src/i18n/format";

interface ProjectTableProps {
  projects: ProjectWithClient[];
}

function formatAreaCell(area: number | null) {
  if (area === null) {
    return bg.common.empty;
  }

  return formatArea(area);
}

export function ProjectTable({ projects }: ProjectTableProps) {
  if (projects.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderKanbanIcon />
          </EmptyMedia>
          <EmptyTitle>{bg.projects.table.emptyTitle}</EmptyTitle>
          <EmptyDescription>{bg.projects.table.emptyDescription}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <NewProjectLink />
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{bg.projects.table.projectNumber}</TableHead>
          <TableHead>{bg.projects.table.project}</TableHead>
          <TableHead>{bg.projects.table.client}</TableHead>
          <TableHead>{bg.projects.table.classification}</TableHead>
          <TableHead>{bg.projects.table.area}</TableHead>
          <TableHead>{bg.projects.table.status}</TableHead>
          <TableHead>{bg.projects.table.created}</TableHead>
          <TableHead className="text-right">{bg.projects.table.actions}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TableCell className="font-mono text-sm text-muted-foreground">
              {project.project_number}
            </TableCell>
            <TableCell>
              <Link
                href={`/projects/${project.id}`}
                className="font-medium hover:underline"
              >
                {project.name}
              </Link>
              {project.site_address ? (
                <div className="max-w-xs truncate text-muted-foreground">
                  {project.site_address}
                </div>
              ) : null}
            </TableCell>
            <TableCell>{project.client_display_name}</TableCell>
            <TableCell>{getProjectClassificationLabel(project)}</TableCell>
            <TableCell>{formatAreaCell(project.site_area)}</TableCell>
            <TableCell>
              <ProjectStatusBadge status={project.engagement_status} />
            </TableCell>
            <TableCell>{formatShortDate(project.created_at.slice(0, 10))}</TableCell>
            <TableCell className="text-right">
              <ProjectTableRowActions project={project} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
