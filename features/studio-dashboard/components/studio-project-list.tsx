"use client";

import Link from "next/link";
import { ChevronDownIcon, FolderKanbanIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StudioProjectTimeline } from "@/features/studio-dashboard/components/studio-project-timeline";
import { StudioWorkflowGroupsTable } from "@/features/studio-dashboard/components/studio-workflow-groups-table";
import {
  readExpandedProjectId,
  writeExpandedProjectId,
} from "@/features/studio-dashboard/lib/studio-dashboard-storage";
import type { StudioProjectRow } from "@/features/studio-dashboard/types/studio-dashboard-view";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

interface StudioProjectRowProps {
  project: StudioProjectRow;
  expanded: boolean;
  onToggle: (projectId: string) => void;
}

const STATUS_BADGE_STYLES: Record<
  StudioProjectRow["status"],
  string
> = {
  in_progress: "border-blue-500/20 bg-blue-500/10 text-blue-800 dark:text-blue-200",
  waiting:
    "border-orange-500/20 bg-orange-500/10 text-orange-800 dark:text-orange-200",
  overdue: "border-red-500/20 bg-red-500/10 text-red-800 dark:text-red-200",
  completed:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  paused: "border-border bg-muted/40 text-muted-foreground",
  inquiry: "border-border bg-muted/40 text-muted-foreground",
};

export function StudioProjectRowCard({
  project,
  expanded,
  onToggle,
}: StudioProjectRowProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="grid gap-3 px-4 py-3 lg:grid-cols-[minmax(12rem,16rem)_1fr_minmax(7rem,8rem)] lg:items-center lg:gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <FolderKanbanIcon className="size-4" />
          </div>
          <div className="grid min-w-0 gap-1">
            <Link
              href={project.href}
              className="truncate font-medium hover:underline"
            >
              {project.name}
            </Link>
            <p className="truncate text-xs text-muted-foreground">
              {project.object_type_label} · {project.area_label}
            </p>
            <Badge
              variant="outline"
              className={cn("w-fit font-normal", STATUS_BADGE_STYLES[project.status])}
            >
              {project.status_label}
            </Badge>
          </div>
        </div>

        <div className="min-w-0 border-y border-border/40 py-3 lg:border-y-0 lg:py-0">
          <StudioProjectTimeline steps={project.timeline} />
        </div>

        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <div className="grid min-w-0 flex-1 gap-1 lg:flex-none lg:text-right">
            <p className="text-lg font-semibold tabular-nums">
              {project.progress_percent}%
            </p>
            <Progress value={project.progress_percent} className="h-1.5" />
          </div>
          <button
            type="button"
            aria-expanded={expanded}
            aria-label={project.name}
            onClick={() => onToggle(project.id)}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:bg-muted/40"
          >
            <ChevronDownIcon
              className={cn(
                "size-4 transition-transform",
                expanded && "rotate-180"
              )}
            />
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="border-t border-border/60 px-4 py-3">
          <StudioWorkflowGroupsTable groups={project.workflow_groups} />
        </div>
      ) : null}
    </article>
  );
}

interface StudioProjectListProps {
  projects: StudioProjectRow[];
}

export function StudioProjectList({ projects }: StudioProjectListProps) {
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const savedProjectId = readExpandedProjectId();

    if (savedProjectId && projects.some((project) => project.id === savedProjectId)) {
      setExpandedProjectId(savedProjectId);
    }
  }, [projects]);

  useEffect(() => {
    writeExpandedProjectId(expandedProjectId);
  }, [expandedProjectId]);

  function handleToggle(projectId: string) {
    setExpandedProjectId((current) => (current === projectId ? null : projectId));
  }

  return (
    <section className="grid gap-4">
      <h2 className="text-title">{bg.studioDashboard.projects.title}</h2>

      {projects.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/60 px-4 py-8 text-sm text-muted-foreground">
          {bg.studioDashboard.projects.empty}
        </p>
      ) : (
        <div className="grid gap-2">
          {projects.map((project) => (
            <StudioProjectRowCard
              key={project.id}
              project={project}
              expanded={expandedProjectId === project.id}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </section>
  );
}
