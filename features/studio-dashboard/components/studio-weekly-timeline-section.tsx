"use client";

import Link from "next/link";

import {
  CapacityLoadLabel,
  ProgressBar,
  ProjectColorProvider,
} from "@/features/studio-dashboard/components/visual-identity";
import {
  DASHBOARD_CARD_CLASS,
  DashboardEmptyState,
  DashboardPanel,
} from "@/features/studio-dashboard/components/dashboard-ui";
import { calculateLoad } from "@/features/planner/capacity";
import { WEEKLY_CAPACITY_HOURS } from "@/features/planner/capacity";
import type {
  StudioTimelineBlock,
  StudioTimelineDay,
  StudioTimelineMilestone,
  StudioTimelineMilestoneCategory,
  StudioTimelineProjectRow,
  StudioWeeklyTimelineView,
} from "@/features/studio-dashboard/types/studio-weekly-timeline-view";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

interface StudioWeeklyTimelineSectionProps {
  timeline: StudioWeeklyTimelineView;
  showCapacityForecast?: boolean;
  showMilestones?: boolean;
}

const PILL_STYLES = {
  completed:
    "border border-[#35D07F]/35 bg-[#35D07F]/18 text-[#35D07F]",
  current:
    "border border-[#3B82F6]/35 bg-[#3B82F6]/22 text-[#93C5FD]",
  future:
    "border border-[#8B5CF6]/35 bg-[#8B5CF6]/18 text-[#C4B5FD]",
  waiting:
    "border border-[#F59E0B]/35 bg-[#F59E0B]/20 text-[#FCD34D]",
} as const;

const GANTT_LABEL_COLUMN = "minmax(0, 6.5rem)";

function buildGanttGridColumns(dayCount: number) {
  return `${GANTT_LABEL_COLUMN} repeat(${dayCount}, minmax(0, 1fr))`;
}

const MILESTONE_CATEGORY_LABELS: Record<StudioTimelineMilestoneCategory, string> = {
  presentation: bg.commandCenter.studioTimeline.milestones.presentation,
  approval: bg.commandCenter.studioTimeline.milestones.approval,
  delivery: bg.commandCenter.studioTimeline.milestones.delivery,
  installation: bg.commandCenter.studioTimeline.milestones.installation,
};

export function StudioWeeklyTimelineSection({
  timeline,
  showCapacityForecast = true,
  showMilestones = true,
}: StudioWeeklyTimelineSectionProps) {
  const todayIndex = timeline.days.findIndex((day) => day.is_today);
  const gridColumns = buildGanttGridColumns(timeline.days.length);

  return (
    <DashboardPanel title={bg.commandCenter.studioTimeline.title} plainHeader>
      <div className="grid gap-6">
        <div className="hidden w-full min-w-0 md:block">
          <div className="relative w-full min-w-0 overflow-hidden rounded-[1.125rem] border border-border/50 bg-background/40">
            <div className="grid w-full min-w-0" style={{ gridTemplateColumns: gridColumns }}>
              <div className="border-b border-r border-border/40 bg-muted/20 px-2 py-3" />
              {timeline.days.map((day) => (
                <DayHeaderCell key={day.date_iso} day={day} />
              ))}
            </div>

            {timeline.project_rows.length === 0 ? (
              <div className="p-4">
                <DashboardEmptyState>
                  {bg.commandCenter.studioTimeline.emptyProjects}
                </DashboardEmptyState>
              </div>
            ) : (
              timeline.project_rows.map((row) => (
                <GanttProjectRow
                  key={row.project_id}
                  row={row}
                  days={timeline.days}
                  gridColumns={gridColumns}
                  todayIndex={todayIndex}
                />
              ))
            )}
          </div>
        </div>

        <TimelineMobile timeline={timeline} />
        {showCapacityForecast ? (
          <CapacityForecastSection forecast={timeline.capacity_forecast} />
        ) : null}
        {showMilestones ? <MilestonesSection milestones={timeline.milestones} /> : null}
      </div>
    </DashboardPanel>
  );
}

function TimelineMobile({ timeline }: { timeline: StudioWeeklyTimelineView }) {
  return (
    <div className="grid gap-6 md:hidden">
      {timeline.project_rows.length === 0 ? (
        <DashboardEmptyState>{bg.commandCenter.studioTimeline.emptyProjects}</DashboardEmptyState>
      ) : (
        timeline.project_rows.map((row) => (
          <ProjectColorProvider key={row.project_id} projectId={row.project_id}>
            <article className={cn("grid gap-3 p-4", DASHBOARD_CARD_CLASS)}>
              <Link href={row.href} className="font-semibold">
                {row.project_name}
              </Link>
              <div className="grid gap-2">
                {timeline.days.map((day) => {
                  const dayBlocks = row.blocks.filter(
                    (block) =>
                      block.start_day_index <= day.index &&
                      block.start_day_index + block.span_days > day.index
                  );

                  return (
                    <div
                      key={day.date_iso}
                      className={cn(
                        "grid gap-2 rounded-lg border border-border/40 p-2",
                        day.is_weekend && "bg-muted/25",
                        day.is_today && "border-blue-500/30 bg-blue-500/5"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span
                          className={cn(
                            "font-medium",
                            day.is_today && "text-blue-700 dark:text-blue-300"
                          )}
                        >
                          {day.label}
                        </span>
                        {day.is_today ? (
                          <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-blue-700 dark:text-blue-300">
                            {bg.commandCenter.studioTimeline.today}
                          </span>
                        ) : null}
                      </div>
                      {dayBlocks.length === 0 ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {dayBlocks.map((block) => (
                            <TimelineBlockChip key={block.id} block={block} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </article>
          </ProjectColorProvider>
        ))
      )}
    </div>
  );
}

function GanttProjectRow({
  row,
  days,
  gridColumns,
  todayIndex,
}: {
  row: StudioTimelineProjectRow;
  days: StudioTimelineDay[];
  gridColumns: string;
  todayIndex: number;
}) {
  return (
    <ProjectColorProvider projectId={row.project_id}>
      <div
        className="grid min-h-[3.25rem] items-stretch border-t border-border/40"
        style={{ gridTemplateColumns: gridColumns }}
      >
        <div className="flex min-w-0 items-center border-r border-border/30 bg-muted/10 px-2 py-2">
          <Link
            href={row.href}
            className="truncate text-xs font-semibold leading-snug hover:underline"
            title={row.project_name}
          >
            {row.project_name}
          </Link>
        </div>

        <div
          className="relative col-span-1 min-w-0"
          style={{
            gridColumn: "2 / -1",
            gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
            display: "grid",
          }}
        >
          {days.map((day) => (
            <div
              key={`${row.project_id}-${day.date_iso}`}
              className={cn(
                "border-r border-border/25 last:border-r-0",
                day.is_weekend && "bg-muted/15",
                day.is_today && "bg-[#3B82F6]/[0.06]"
              )}
            />
          ))}

          {todayIndex >= 0 ? (
            <div
              className="pointer-events-none absolute inset-y-0 z-10 w-px bg-[#3B82F6]/50"
              style={{
                left: `${((todayIndex + 0.5) / days.length) * 100}%`,
              }}
            />
          ) : null}

          {row.deadline_day_index !== null ? (
            <div
              className="pointer-events-none absolute inset-y-1 z-20 w-0.5 rounded-full bg-[#EF4444]"
              style={{
                left: `${((row.deadline_day_index + 0.5) / days.length) * 100}%`,
              }}
              title={bg.commandCenter.studioTimeline.deadline}
            />
          ) : null}

          {row.blocks.map((block) => (
            <GanttStagePill key={block.id} block={block} dayCount={days.length} />
          ))}
        </div>
      </div>
    </ProjectColorProvider>
  );
}

function GanttStagePill({
  block,
  dayCount,
}: {
  block: StudioTimelineBlock;
  dayCount: number;
}) {
  return (
    <Link
      href={block.href}
      className={cn(
        "absolute top-1/2 z-30 flex h-7 -translate-y-1/2 items-center overflow-hidden rounded-full px-2.5 text-[10px] font-medium leading-none shadow-sm transition-transform hover:z-40 hover:scale-[1.02]",
        PILL_STYLES[block.state]
      )}
      style={{
        left: `${(block.start_day_index / dayCount) * 100}%`,
        width: `${(block.span_days / dayCount) * 100}%`,
        minWidth: "1.75rem",
      }}
      title={block.label}
    >
      <span className="truncate">{block.label}</span>
    </Link>
  );
}

function DayHeaderCell({ day }: { day: StudioTimelineDay }) {
  return (
    <div
      className={cn(
        "min-w-0 border-b border-r border-border/40 px-0.5 py-2 text-center text-[10px] font-medium uppercase tracking-wide last:border-r-0",
        day.is_weekend && "bg-muted/15 text-muted-foreground",
        day.is_today && "bg-[#3B82F6]/10 text-[#93C5FD]"
      )}
    >
      <span className="block truncate">{day.label}</span>
      {day.is_today ? (
        <span className="mt-0.5 block truncate text-[9px] normal-case tracking-normal">
          {bg.commandCenter.studioTimeline.today}
        </span>
      ) : null}
    </div>
  );
}

function TimelineBlockChip({
  block,
}: {
  block: StudioTimelineBlock;
  projectId?: string;
}) {
  return (
    <Link
      href={block.href}
      className={cn(
        "inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
        PILL_STYLES[block.state]
      )}
    >
      <span className="truncate">{block.label}</span>
    </Link>
  );
}

function CapacityForecastSection({
  forecast,
}: {
  forecast: StudioWeeklyTimelineView["capacity_forecast"];
}) {
  const weeks = [
    {
      label: bg.commandCenter.studioTimeline.capacity.thisWeek,
      hours: forecast.this_week_hours,
    },
    {
      label: bg.commandCenter.studioTimeline.capacity.nextWeek,
      hours: forecast.next_week_hours,
    },
    {
      label: bg.commandCenter.studioTimeline.capacity.followingWeek,
      hours: forecast.following_week_hours,
    },
  ];

  return (
    <div className="grid gap-4">
      <h3 className="text-sm font-semibold">{bg.commandCenter.studioTimeline.capacity.title}</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {weeks.map((week) => {
          const load = calculateLoad(week.hours);

          return (
            <article
              key={week.label}
              className={cn("grid gap-3 p-4", DASHBOARD_CARD_CLASS)}
            >
              <div className="flex items-end justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {week.label}
                </p>
                <CapacityLoadLabel percent={load} className="text-xs" />
              </div>
              <p className="text-2xl font-semibold tabular-nums">
                {bg.commandCenter.capacity.hours(week.hours)}
              </p>
              <ProgressBar value={load} variant="capacity" className="h-2" />
              <p className="text-xs text-muted-foreground">
                {week.hours} / {WEEKLY_CAPACITY_HOURS}
                {bg.common.hoursShort}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function MilestonesSection({
  milestones,
  showTitle = true,
}: {
  milestones: StudioTimelineMilestone[];
  showTitle?: boolean;
}) {
  const grouped = (["presentation", "approval", "delivery", "installation"] as const).map(
    (category) => ({
      category,
      items: milestones.filter((item) => item.category === category),
    })
  );

  return (
    <div className="grid gap-4">
      {showTitle ? (
        <h3 className="text-sm font-semibold">{bg.commandCenter.studioTimeline.milestones.title}</h3>
      ) : null}

      {milestones.length === 0 ? (
        <DashboardEmptyState>{bg.commandCenter.studioTimeline.milestones.empty}</DashboardEmptyState>
      ) : (
        <div
          className={cn(
            "grid gap-4",
            showTitle ? "md:grid-cols-2 xl:grid-cols-4" : "grid-cols-1"
          )}
        >
          {grouped.map((group) => (
            <div
              key={group.category}
              className="grid gap-3 rounded-xl border border-border/60 bg-background/70 p-4"
            >
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {MILESTONE_CATEGORY_LABELS[group.category]}
              </h4>
              {group.items.length === 0 ? (
                <p className="text-xs text-muted-foreground">—</p>
              ) : (
                <ul className="grid gap-2">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className="grid gap-0.5 rounded-lg px-2 py-2 transition-colors hover:bg-muted/30"
                      >
                        <span className="text-sm font-medium">{item.project_name}</span>
                        <span className="text-xs text-muted-foreground">{item.stage_name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function StudioUpcomingEventsSection({
  milestones,
}: {
  milestones: StudioTimelineMilestone[];
}) {
  return (
    <DashboardPanel title={bg.commandCenter.upcomingEvents.title} plainHeader>
      <MilestonesSection milestones={milestones} showTitle={false} />
    </DashboardPanel>
  );
}
