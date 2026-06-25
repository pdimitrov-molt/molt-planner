import { CalendarDaysIcon } from "lucide-react";

import { InsetPanel, SurfaceCard } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { ProjectWorkspace } from "@/features/projects/types/project-workspace";
import { bg } from "@/src/i18n/bg";

interface WorkspaceTodayProps {
  workspace: ProjectWorkspace;
}

export function WorkspaceToday({ workspace }: WorkspaceTodayProps) {
  return (
    <SurfaceCard className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-title">{bg.projects.workspace.today.title}</h2>
        <p className="text-body">{bg.projects.workspace.today.subtitle}</p>
      </div>

      {workspace.today_tasks.length === 0 ? (
        <Empty className="border-none p-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarDaysIcon />
            </EmptyMedia>
            <EmptyTitle>{bg.projects.workspace.today.emptyTitle}</EmptyTitle>
            <EmptyDescription>
              {bg.projects.workspace.today.emptyDescription}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="grid gap-4">
          {workspace.today_tasks.map((task) => (
            <li key={task.id}>
              <InsetPanel>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-section-title">{task.title}</p>
                    <p className="mt-2 text-body">
                      {task.room_name} · {task.phase_label}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {task.estimated_hours}
                    {bg.common.hoursShort}
                  </Badge>
                </div>
                <p className="mt-3 text-eyebrow">{task.status_label}</p>
              </InsetPanel>
            </li>
          ))}
        </ul>
      )}
    </SurfaceCard>
  );
}
