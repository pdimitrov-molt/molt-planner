"use client";

import Link from "next/link";
import { ArrowRightIcon, TimerIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StudioTodayWorkItem } from "@/features/studio-dashboard/types/studio-dashboard-view";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";
import { formatLongDate } from "@/src/i18n/format";

interface StudioTodayWorkSectionProps {
  items: StudioTodayWorkItem[];
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

export function StudioTodayWorkSection({ items }: StudioTodayWorkSectionProps) {
  return (
    <section className="grid gap-4">
      <div className="grid gap-1">
        <h2 className="text-title">{bg.planningEngine.todayWork.title}</h2>
        <p className="text-sm text-muted-foreground">
          {bg.planningEngine.todayWork.subtitle}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/60 px-4 py-8 text-sm text-muted-foreground">
          {bg.planningEngine.todayWork.empty}
        </p>
      ) : (
        <ol className="grid gap-2">
          {items.map((item) => (
            <li key={item.id}>
              <TodayWorkRow item={item} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function TodayWorkRow({ item }: { item: StudioTodayWorkItem }) {
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
            <p>
              {item.group_name} · {item.stage_name}
              {item.room_name ? ` · ${item.room_name}` : null}
            </p>
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

function formatSlackLabel(slackDays: number): string {
  if (slackDays < 0) {
    return bg.planningEngine.todayWork.slackOverdue(Math.abs(slackDays));
  }

  if (slackDays === 0) {
    return bg.planningEngine.todayWork.slackDueToday;
  }

  return bg.planningEngine.todayWork.slackRemaining(slackDays);
}
