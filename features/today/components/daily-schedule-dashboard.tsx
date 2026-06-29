"use client";

import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-shell";
import {
  DashboardEmptyState,
  DashboardPanel,
  DASHBOARD_CARD_CLASS,
  DASHBOARD_CARD_INTERACTIVE_CLASS,
} from "@/features/studio-dashboard/components/dashboard-ui";
import { ProjectColorProvider } from "@/features/studio-dashboard/components/visual-identity";
import type {
  DailyScheduleItem,
  DailyScheduleItemKind,
  DailyScheduleView,
} from "@/features/today/types/daily-schedule-view";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

interface DailyScheduleDashboardProps {
  view: DailyScheduleView;
}

const KIND_STYLES: Record<
  DailyScheduleItemKind,
  { badge: string; border: string; time: string }
> = {
  project: {
    badge: "bg-[#35D07F]/15 text-[#35D07F]",
    border: "border-l-[#35D07F]",
    time: "text-[#35D07F]",
  },
  personal: {
    badge: "bg-[#8B5CF6]/15 text-[#C4B5FD]",
    border: "border-l-[#8B5CF6]",
    time: "text-[#C4B5FD]",
  },
  meeting: {
    badge: "bg-[#3B82F6]/15 text-[#93C5FD]",
    border: "border-l-[#3B82F6]",
    time: "text-[#93C5FD]",
  },
  reminder: {
    badge: "bg-[#EC4899]/15 text-[#F9A8D4]",
    border: "border-l-[#EC4899]",
    time: "text-[#F9A8D4]",
  },
  waiting: {
    badge: "bg-[#F59E0B]/15 text-[#FCD34D]",
    border: "border-l-[#F59E0B]",
    time: "text-[#FCD34D]",
  },
};

function kindLabel(kind: DailyScheduleItemKind): string {
  return bg.dailySchedule.kinds[kind];
}

export function DailyScheduleDashboard({ view }: DailyScheduleDashboardProps) {
  const hasItems = view.timed_items.length > 0 || view.untimed_items.length > 0;

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Studio OS"
        title={bg.dailySchedule.title}
        description={view.date_label}
      />

      <section className="rounded-[1.125rem] border border-border bg-card p-6 shadow-[var(--card-shadow)]">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="grid gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              {bg.dailySchedule.greeting(view.user_name)}
            </h2>
            <p className="text-sm text-muted-foreground">{bg.dailySchedule.summaryIntro}</p>
          </div>

          <ul className="grid gap-2 text-sm sm:grid-cols-2 lg:min-w-[18rem] lg:grid-cols-1">
            <SummaryLine
              label={bg.dailySchedule.summary.projectTasks(view.summary.project_tasks)}
            />
            <SummaryLine
              label={bg.dailySchedule.summary.personalTasks(view.summary.personal_tasks)}
            />
            <SummaryLine
              label={bg.dailySchedule.summary.meetings(view.summary.meetings)}
            />
            <SummaryLine
              label={bg.dailySchedule.summary.waiting(view.summary.waiting)}
            />
          </ul>
        </div>
      </section>

      {!hasItems ? (
        <DashboardEmptyState>{bg.dailySchedule.empty}</DashboardEmptyState>
      ) : (
        <div className="grid gap-5">
          {view.timed_items.length > 0 ? (
            <ScheduleSection
              title={bg.dailySchedule.sections.timed}
              items={view.timed_items}
              showTime
            />
          ) : null}

          {view.untimed_items.length > 0 ? (
            <ScheduleSection
              title={bg.dailySchedule.sections.untimed}
              items={view.untimed_items}
              showTime={false}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

function SummaryLine({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/70 px-3 py-2">
      <span aria-hidden className="size-1.5 rounded-full bg-primary" />
      <span>{label}</span>
    </li>
  );
}

function ScheduleSection({
  title,
  items,
  showTime,
}: {
  title: string;
  items: DailyScheduleItem[];
  showTime: boolean;
}) {
  return (
    <DashboardPanel title={title} plainHeader>
      <div className="grid gap-3">
        {items.map((item) => (
          <ScheduleItemRow key={item.id} item={item} showTime={showTime} />
        ))}
      </div>
    </DashboardPanel>
  );
}

function ScheduleItemRow({
  item,
  showTime,
}: {
  item: DailyScheduleItem;
  showTime: boolean;
}) {
  const styles = KIND_STYLES[item.kind];

  const content = (
    <Link
      href={item.href}
      className={cn(
        DASHBOARD_CARD_CLASS,
        DASHBOARD_CARD_INTERACTIVE_CLASS,
        "group grid gap-4 border-l-[3px] p-4 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:items-center",
        styles.border
      )}
    >
      <div className="grid gap-1 sm:text-right">
        <span className="text-xs uppercase tracking-wide text-muted-foreground sm:hidden">
          {bg.dailySchedule.columns.time}
        </span>
        <span
          className={cn(
            "text-lg font-semibold tabular-nums leading-none",
            showTime && item.time_label ? styles.time : "text-muted-foreground"
          )}
        >
          {showTime && item.time_label ? item.time_label : bg.dailySchedule.noTime}
        </span>
      </div>

      <div className="grid min-w-0 gap-2">
        <span
          className={cn(
            "w-fit rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
            styles.badge
          )}
        >
          {kindLabel(item.kind)}
        </span>
        <p className="truncate text-base font-semibold tracking-tight">{item.title}</p>
        <p className="truncate text-sm text-muted-foreground">{item.subtitle}</p>
      </div>

      <ChevronRightIcon className="size-4 shrink-0 justify-self-end text-muted-foreground transition-transform group-hover:translate-x-0.5 sm:justify-self-center" />
    </Link>
  );

  if (item.project_id) {
    return <ProjectColorProvider projectId={item.project_id}>{content}</ProjectColorProvider>;
  }

  return content;
}
