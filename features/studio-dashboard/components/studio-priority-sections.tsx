"use client";

import Link from "next/link";
import { ArrowRightIcon, TimerIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  StudioDashboardBlockedItem,
  StudioDashboardDeadlineItem,
  StudioDashboardPausedItem,
  StudioDashboardPrioritySection,
  StudioTodayWorkItem,
} from "@/features/studio-dashboard/types/studio-dashboard-view";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";
import { formatLongDate } from "@/src/i18n/format";

interface StudioPrioritySectionsProps {
  sections: StudioDashboardPrioritySection[];
}

const STATUS_BADGE_STYLES: Record<
  StudioTodayWorkItem["status"],
  string
> = {
  in_progress: "border-blue-500/20 bg-blue-500/10 text-blue-800 dark:text-blue-200",
  not_started: "border-border bg-muted/40 text-muted-foreground",
  blocked: "border-orange-500/20 bg-orange-500/10 text-orange-800 dark:text-orange-200",
  completed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
};

export function StudioPrioritySections({ sections }: StudioPrioritySectionsProps) {
  if (sections.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border/60 px-4 py-8 text-sm text-muted-foreground">
        {bg.planningEngine.todayWork.empty}
      </p>
    );
  }

  return (
    <div className="grid gap-8">
      {sections.map((section) => (
        <PrioritySection key={section.tier} section={section} />
      ))}
    </div>
  );
}

function PrioritySection({ section }: { section: StudioDashboardPrioritySection }) {
  const hasWork = section.workItems.length > 0;
  const hasPaused = section.pausedItems.length > 0;
  const hasBlocked = section.blockedItems.length > 0;
  const hasDeadlines = section.deadlineItems.length > 0;

  return (
    <section className="grid gap-4">
      <div className="grid gap-1">
        <h2 className="text-title">{section.title}</h2>
        <p className="text-sm text-muted-foreground">{section.subtitle}</p>
      </div>

      {hasWork ? (
        <ol className="grid gap-2">
          {section.workItems.map((item) => (
            <li key={item.id}>
              <WorkRow item={item} />
            </li>
          ))}
        </ol>
      ) : null}

      {hasPaused ? (
        <ul className="grid gap-2">
          {section.pausedItems.map((item) => (
            <li key={item.id}>
              <PausedRow item={item} />
            </li>
          ))}
        </ul>
      ) : null}

      {hasBlocked ? (
        <ul className="grid gap-2">
          {section.blockedItems.map((item) => (
            <li key={item.id}>
              <BlockedRow item={item} />
            </li>
          ))}
        </ul>
      ) : null}

      {hasDeadlines ? (
        <ul className="grid gap-2">
          {section.deadlineItems.map((item) => (
            <li key={item.id}>
              <DeadlineRow item={item} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function WorkRow({ item }: { item: StudioTodayWorkItem }) {
  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-2xl border bg-card px-4 py-4 shadow-sm sm:flex-row sm:items-center",
        item.is_active_timer
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-border/60"
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold tabular-nums text-primary">
          {item.rank}
        </span>

        <div className="grid min-w-0 flex-1 gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{item.project_name}</p>
            <Badge
              variant="outline"
              className={cn("font-normal", STATUS_BADGE_STYLES[item.status])}
            >
              {item.status_label}
            </Badge>
            {item.is_active_timer ? (
              <Badge className="gap-1 border-emerald-500/20 bg-emerald-500/10 font-normal text-emerald-800 dark:text-emerald-200">
                <TimerIcon className="size-3" />
                {bg.planningEngine.todayWork.activeTimer}
              </Badge>
            ) : null}
          </div>

          <div className="grid gap-0.5 text-sm text-muted-foreground">
            <p>{formatStageContext(item)}</p>
            <p className="text-xs">
              {bg.planningEngine.todayWork.remainingHours(item.remaining_hours)}
              {" · "}
              {bg.planningEngine.todayWork.finishBy(formatLongDate(item.estimated_finish_date))}
              {item.slack_days !== null
                ? ` · ${formatSlackLabel(item.slack_days)}`
                : null}
            </p>
          </div>
        </div>
      </div>

      <Button asChild size="sm" className="shrink-0 rounded-xl">
        <Link href={item.href}>
          {bg.planningEngine.todayWork.startWork}
          <ArrowRightIcon className="size-4" />
        </Link>
      </Button>
    </article>
  );
}

function formatStageContext(item: StudioTodayWorkItem): string {
  if (item.instance_name) {
    return `${item.group_name} · ${item.stage_name} · ${item.instance_name}`;
  }

  return `${item.group_name} · ${item.stage_name}`;
}

function PausedRow({ item }: { item: StudioDashboardPausedItem }) {
  return (
    <Link
      href={item.href}
      className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 transition-colors hover:bg-muted/20"
    >
      <div className="grid min-w-0 gap-1">
        <p className="text-sm font-medium">{item.project_name}</p>
        <p className="text-xs text-muted-foreground">
          {formatStageInstanceContext(item.group_name, item.stage_name, item.instance_name)}
        </p>
      </div>
      <Badge variant="secondary" className="shrink-0">
        {bg.actionCenter.waiting.paused}
      </Badge>
    </Link>
  );
}

function BlockedRow({ item }: { item: StudioDashboardBlockedItem }) {
  return (
    <Link
      href={item.href}
      className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 transition-colors hover:bg-muted/20"
    >
      <div className="grid min-w-0 gap-1">
        <p className="text-sm font-medium">{item.project_name}</p>
        <p className="text-xs text-muted-foreground">
          {formatStageInstanceContext(item.group_name, item.stage_name, item.instance_name)}
        </p>
      </div>
      <Badge variant="destructive" className="shrink-0">
        {bg.actionCenter.waiting.blocked}
      </Badge>
    </Link>
  );
}

function DeadlineRow({ item }: { item: StudioDashboardDeadlineItem }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 transition-colors hover:bg-muted/20",
        item.is_overdue && "border-amber-500/30 bg-amber-500/5"
      )}
    >
      <div className="grid min-w-0 gap-0.5">
        <p className="truncate text-sm font-medium">{item.project_name}</p>
        <p className="truncate text-xs text-muted-foreground">{item.label}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {item.is_overdue ? (
          <Badge variant="destructive" className="text-xs">
            {bg.actionCenter.deadlines.overdue}
          </Badge>
        ) : null}
        <span className="text-sm font-medium tabular-nums">{item.date_label}</span>
      </div>
    </Link>
  );
}

function formatStageInstanceContext(
  groupName: string,
  stageName: string,
  instanceName: string | null
): string {
  if (instanceName) {
    return `${groupName} · ${stageName} · ${instanceName}`;
  }

  return `${groupName} · ${stageName}`;
}

function formatSlackLabel(slackDays: number): string {
  if (slackDays < 0) {
    return bg.planningEngine.todayWork.slackOverdue(Math.abs(slackDays));
  }

  if (slackDays === 0) {
    return bg.planningEngine.todayWork.slackDueToday;
  }

  return bg.planningEngine.todayWork.slackRemaining(slackDays);
}
