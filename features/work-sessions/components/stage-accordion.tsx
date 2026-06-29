"use client";

import type { ReactNode } from "react";
import { ChevronDownIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { PhaseStatus } from "@/features/phases/types/phase";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

export interface StageAccordionItem {
  id: string;
  title: string;
  subtitle?: string | null;
  status: PhaseStatus;
  progress_percent: number;
  is_current?: boolean;
  enabled?: boolean;
}

interface StageAccordionListProps {
  items: StageAccordionItem[];
  expandedStageId: string | null;
  onToggleStage: (stageId: string) => void;
  renderExpandedContent: (item: StageAccordionItem) => ReactNode;
}

const STATUS_BADGE_STYLES: Record<PhaseStatus, string> = {
  in_progress: "border-blue-500/20 bg-blue-500/10 text-blue-800 dark:text-blue-200",
  not_started: "border-border bg-muted/40 text-muted-foreground",
  blocked: "border-orange-500/20 bg-orange-500/10 text-orange-800 dark:text-orange-200",
  completed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
};

function phaseStatusLabel(status: PhaseStatus): string {
  return bg.labels.phaseStatus[status];
}

export function StageAccordionList({
  items,
  expandedStageId,
  onToggleStage,
  renderExpandedContent,
}: StageAccordionListProps) {
  const visibleItems = items.filter((item) => item.enabled !== false);

  if (visibleItems.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border/60 px-4 py-6 text-sm text-muted-foreground">
        {bg.workflowEngine.noStages}
      </p>
    );
  }

  return (
    <ol className="grid gap-2">
      {visibleItems.map((item) => {
        const isExpanded = expandedStageId === item.id;

        return (
          <li
            key={item.id}
            className={cn(
              "overflow-hidden rounded-xl border border-border/60 bg-background/50",
              item.is_current && "ring-1 ring-emerald-500/20",
              isExpanded && "bg-card shadow-sm"
            )}
          >
            <button
              type="button"
              aria-expanded={isExpanded}
              onClick={() => onToggleStage(item.id)}
              className="flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/20"
            >
              <div className="grid min-w-0 flex-1 gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{item.title}</span>
                  {item.subtitle ? (
                    <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                  ) : null}
                  {item.is_current ? (
                    <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                      {bg.workflowEngine.currentStage}
                    </Badge>
                  ) : null}
                  <Badge
                    variant="outline"
                    className={cn("font-normal", STATUS_BADGE_STYLES[item.status])}
                  >
                    {phaseStatusLabel(item.status)}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Progress value={item.progress_percent} className="h-1.5 flex-1" />
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {item.progress_percent}%
                  </span>
                </div>
              </div>

              <ChevronDownIcon
                className={cn(
                  "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform",
                  isExpanded && "rotate-180"
                )}
              />
            </button>

            {isExpanded ? (
              <div className="border-t border-border/60 px-3 py-4">
                {renderExpandedContent(item)}
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function phaseProgressFromStatus(status: PhaseStatus): number {
  switch (status) {
    case "completed":
      return 100;
    case "in_progress":
      return 50;
    case "blocked":
      return 25;
    default:
      return 0;
  }
}

export function phaseProgressPercent(input: {
  status: PhaseStatus;
  worked_hours?: number;
  estimated_hours?: number;
}): number {
  if (input.estimated_hours && input.estimated_hours > 0 && input.worked_hours !== undefined) {
    return Math.min(
      100,
      Math.round((input.worked_hours / input.estimated_hours) * 100)
    );
  }

  return phaseProgressFromStatus(input.status);
}
