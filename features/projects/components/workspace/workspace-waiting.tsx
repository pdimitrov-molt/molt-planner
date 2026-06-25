import { HourglassIcon } from "lucide-react";

import { InsetPanel, SurfaceCard } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type {
  ProjectWorkspace,
  WaitingCategory,
} from "@/features/projects/types/project-workspace";
import { bg } from "@/src/i18n/bg";

interface WorkspaceWaitingProps {
  workspace: ProjectWorkspace;
}

function waitingVariant(category: string) {
  switch (category) {
    case "client_approval":
      return "secondary" as const;
    case "supplier_waiting":
      return "outline" as const;
    default:
      return "destructive" as const;
  }
}

export function WorkspaceWaiting({ workspace }: WorkspaceWaitingProps) {
  const grouped: Record<WaitingCategory, ProjectWorkspace["waiting_items"]> = {
    client_approval: workspace.waiting_items.filter(
      (item) => item.category === "client_approval"
    ),
    blocked_phase: workspace.waiting_items.filter(
      (item) => item.category === "blocked_phase"
    ),
    supplier_waiting: workspace.waiting_items.filter(
      (item) => item.category === "supplier_waiting"
    ),
  };

  const hasWaitingItems = workspace.waiting_items.length > 0;

  return (
    <SurfaceCard className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-title">{bg.projects.workspace.waiting.title}</h2>
        <p className="text-body">{bg.projects.workspace.waiting.subtitle}</p>
      </div>

      {!hasWaitingItems ? (
        <Empty className="border-none p-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HourglassIcon />
            </EmptyMedia>
            <EmptyTitle>{bg.projects.workspace.waiting.emptyTitle}</EmptyTitle>
            <EmptyDescription>
              {bg.projects.workspace.waiting.emptyDescription}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-8">
          {(Object.entries(grouped) as Array<
            [WaitingCategory, ProjectWorkspace["waiting_items"]]
          >).map(([category, items]) =>
            items.length === 0 ? null : (
              <section key={category} className="grid gap-4">
                <h3 className="text-eyebrow">{bg.labels.waitingCategory[category]}</h3>
                <ul className="grid gap-4">
                  {items.map((item) => (
                    <li key={item.id}>
                      <InsetPanel>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-section-title">{item.title}</p>
                            <p className="mt-2 text-body">{item.context}</p>
                          </div>
                          <Badge variant={waitingVariant(item.category)}>
                            {item.room_name}
                          </Badge>
                        </div>
                      </InsetPanel>
                    </li>
                  ))}
                </ul>
              </section>
            )
          )}
        </div>
      )}
    </SurfaceCard>
  );
}
