import Link from "next/link";
import { ArrowRightIcon, CircleDashedIcon } from "lucide-react";

import { InsetPanel, SurfaceCard } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { TodayNextTask } from "@/features/today/types/today-view";
import { bg } from "@/src/i18n/bg";

interface NextTaskCardProps {
  task: TodayNextTask | null;
}

export function NextTaskCard({ task }: NextTaskCardProps) {
  return (
    <SurfaceCard className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-title">{bg.today.nextTask.title}</h2>
        <p className="text-body">{bg.today.nextTask.subtitle}</p>
      </div>

      {!task ? (
        <Empty className="border-none p-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CircleDashedIcon />
            </EmptyMedia>
            <EmptyTitle>{bg.today.nextTask.emptyTitle}</EmptyTitle>
            <EmptyDescription>{bg.today.nextTask.emptyDescription}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <InsetPanel className="flex flex-col gap-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-section-title">{task.title}</p>
              <p className="text-body">
                {task.client_display_name} · {task.project_name}
              </p>
              <p className="text-body">
                {task.room_name} · {task.phase_label}
              </p>
            </div>
            <Badge variant="outline">
              {bg.today.nextTask.hours(task.estimated_hours)}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-eyebrow">{task.status_label}</p>
            <Button asChild variant="outline" size="sm">
              <Link href={`/projects/${task.project_id}`}>
                {bg.today.nextTask.openProject}
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </InsetPanel>
      )}
    </SurfaceCard>
  );
}
