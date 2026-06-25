"use client";

import Link from "next/link";
import { useTransition } from "react";
import { MoreHorizontalIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { archiveProjectAction } from "@/features/projects/actions/project.actions";
import type { ProjectWithClient } from "@/features/projects/types/project";
import { bg } from "@/src/i18n/bg";

interface ProjectTableRowActionsProps {
  project: ProjectWithClient;
}

export function ProjectTableRowActions({ project }: ProjectTableRowActionsProps) {
  const [isPending, startTransition] = useTransition();

  function handleArchive() {
    startTransition(async () => {
      const result = await archiveProjectAction({ id: project.id });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(bg.projects.actions.archivedToast);
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href={`/projects/${project.id}`}>{bg.projects.actions.open}</Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" disabled={isPending}>
            <MoreHorizontalIcon />
            <span className="sr-only">{bg.projects.actions.openMenu}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/projects/${project.id}`}>
              {bg.projects.actions.view}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleArchive}>
            {bg.projects.actions.archive}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
