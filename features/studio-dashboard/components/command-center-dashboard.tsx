"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ActivityIcon,
  AlertTriangleIcon,
  ChevronRightIcon,
  ClockIcon,
  FolderKanbanIcon,
  TargetIcon,
} from "lucide-react";

import {
  StudioUpcomingEventsSection,
  StudioWeeklyTimelineSection,
} from "@/features/studio-dashboard/components/studio-weekly-timeline-section";
import { WorkRadarSection } from "@/features/studio-dashboard/components/work-radar-section";
import {
  DASHBOARD_CARD_CLASS,
  DASHBOARD_CARD_INTERACTIVE_CLASS,
  DashboardEmptyState,
  DashboardPanel,
} from "@/features/studio-dashboard/components/dashboard-ui";
import { StudioProjectTimeline } from "@/features/studio-dashboard/components/studio-project-timeline";
import {
  CapacityLoadLabel,
  PlannerScoreBadge,
  ProgressBar,
  ProjectAccent,
  ProjectColorProvider,
  WorkflowChip,
} from "@/features/studio-dashboard/components/visual-identity";
import { calculateLoad } from "@/features/planner/capacity";
import { WEEKLY_CAPACITY_HOURS } from "@/features/planner/capacity";
import {
  RISK_SEVERITY_STYLES,
  getProjectAccentStyles,
  resolveRiskSeverity,
} from "@/features/studio-dashboard/lib/project-accent-colors";
import type { CommandCenterCapacity, CommandCenterCriticalView } from "@/features/studio-dashboard/types/command-center-view";
import type { CommandCenterView } from "@/features/studio-dashboard/types/command-center-view";
import type { StudioTimelineStep } from "@/features/studio-dashboard/types/studio-dashboard-view";
import type { StudioWeeklyTimelineView } from "@/features/studio-dashboard/types/studio-weekly-timeline-view";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

interface CommandCenterDashboardProps {
  critical: CommandCenterCriticalView;
  health: ReactNode;
  sidebar: ReactNode;
}

export function CommandCenterDashboard({
  critical,
  health,
  sidebar,
}: CommandCenterDashboardProps) {
  const waitingItems = critical.waiting_groups.flatMap((group) => group.items);
  const nowItem = critical.todays_focus[0] ?? null;
  const nextItems = critical.todays_focus.slice(1, 3);

  return (
    <div className="grid gap-5">
      {health}

      <div className="grid gap-5 lg:grid-cols-[1.6fr_0.9fr]">
        <div className="grid min-w-0 content-start gap-5">
          <WorkRadarSection
            nowItem={nowItem}
            nextItems={nextItems}
            waitingItems={waitingItems}
            riskProjects={critical.at_risk_projects}
            continueWorking={critical.continue_working}
          />
          <FocusSection items={critical.todays_focus} stacked />
        </div>

        {sidebar}
      </div>
    </div>
  );
}

export function CommandCenterHealthSection({
  critical,
  activeProjectCount,
  capacity,
}: {
  critical: CommandCenterCriticalView;
  activeProjectCount: number;
  capacity: CommandCenterCapacity;
}) {
  const waitingCount = critical.waiting_groups.flatMap((group) => group.items).length;

  return (
    <StudioHealthSection
      activeProjectCount={activeProjectCount}
      focusTodayCount={critical.todays_focus.length}
      waitingCount={waitingCount}
      atRiskCount={critical.at_risk_projects.length}
      capacity={capacity}
      overview
    />
  );
}

export function CommandCenterSidebarSection({
  capacity,
  studioTimeline,
}: {
  capacity: CommandCenterCapacity;
  studioTimeline: StudioWeeklyTimelineView;
}) {
  return (
    <div className="grid min-w-0 content-start gap-5">
      <StudioWeeklyTimelineSection
        timeline={studioTimeline}
        showCapacityForecast={false}
        showMilestones={false}
      />
      <CapacitySection capacity={capacity} stacked />
      <StudioUpcomingEventsSection milestones={studioTimeline.milestones} />
    </div>
  );
}

function StudioHealthSection({
  activeProjectCount,
  focusTodayCount,
  waitingCount,
  atRiskCount,
  capacity,
  compact = false,
  overview = false,
}: {
  activeProjectCount: number;
  focusTodayCount: number;
  waitingCount: number;
  atRiskCount: number;
  capacity: CommandCenterCapacity;
  compact?: boolean;
  overview?: boolean;
}) {
  const weekLoad = calculateLoad(capacity.this_week_hours);

  const metrics = [
    {
      label: bg.commandCenter.studioHealth.activeProjects,
      value: String(activeProjectCount),
      icon: FolderKanbanIcon,
      tone: {
        value: "text-[#3B82F6]",
        icon: "text-[#3B82F6]",
        iconBg: "bg-[#3B82F6]/12",
        border: "border-[#3B82F6]/25",
        surface: "bg-[#3B82F6]/[0.04]",
      },
    },
    {
      label: bg.commandCenter.studioHealth.focusToday,
      value: String(focusTodayCount),
      icon: TargetIcon,
      tone: {
        value: "text-[#35D07F]",
        icon: "text-[#35D07F]",
        iconBg: "bg-[#35D07F]/12",
        border: "border-[#35D07F]/25",
        surface: "bg-[#35D07F]/[0.04]",
      },
    },
    {
      label: bg.commandCenter.studioHealth.waiting,
      value: String(waitingCount),
      icon: ClockIcon,
      tone: {
        value: "text-[#F59E0B]",
        icon: "text-[#F59E0B]",
        iconBg: "bg-[#F59E0B]/12",
        border: "border-[#F59E0B]/25",
        surface: "bg-[#F59E0B]/[0.04]",
      },
    },
    {
      label: bg.commandCenter.studioHealth.atRisk,
      value: String(atRiskCount),
      icon: AlertTriangleIcon,
      tone: {
        value: "text-[#EF4444]",
        icon: "text-[#EF4444]",
        iconBg: "bg-[#EF4444]/12",
        border: "border-[#EF4444]/25",
        surface: "bg-[#EF4444]/[0.04]",
      },
    },
    {
      label: bg.commandCenter.studioHealth.weekLoad,
      value: `${weekLoad}%`,
      icon: ActivityIcon,
      tone: {
        value: "text-[#8B5CF6]",
        icon: "text-[#8B5CF6]",
        iconBg: "bg-[#8B5CF6]/12",
        border: "border-[#8B5CF6]/25",
        surface: "bg-[#8B5CF6]/[0.04]",
      },
    },
  ] as const;

  return (
    <DashboardPanel
      title={bg.commandCenter.studioHealth.title}
      plainHeader={overview}
      className={cn(overview && "gap-4 p-5")}
    >
      <div
        className={cn(
          "grid gap-3",
          overview
            ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
            : compact
              ? "grid-cols-2"
              : "grid-cols-2 xl:grid-cols-5"
        )}
      >
        {metrics.map((metric, index) => (
          <StudioHealthKpiCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            icon={metric.icon}
            tone={metric.tone}
            overview={overview}
            className={cn(compact && index === metrics.length - 1 && "col-span-2")}
          />
        ))}
      </div>
    </DashboardPanel>
  );
}

function StudioHealthKpiCard({
  label,
  value,
  icon: Icon,
  tone,
  overview = false,
  className,
}: {
  label: string;
  value: string;
  icon: typeof FolderKanbanIcon;
  tone: {
    value: string;
    icon: string;
    iconBg: string;
    border: string;
    surface: string;
  };
  overview?: boolean;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "grid gap-3 rounded-[1.125rem] border p-4 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--card-shadow)]",
        overview && "gap-2 p-3",
        tone.border,
        tone.surface,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex size-9 items-center justify-center rounded-lg",
            tone.iconBg
          )}
        >
          <Icon className={cn("size-4", tone.icon)} strokeWidth={2.25} />
        </span>
      </div>

      <div className="grid gap-1">
        <p className={cn("font-bold tabular-nums leading-none tracking-tight", overview ? "text-2xl" : "text-3xl", tone.value)}>
          {value}
        </p>
        <p className="text-xs font-medium leading-snug text-muted-foreground">{label}</p>
      </div>
    </article>
  );
}

function FocusSection({
  items,
  title = bg.commandCenter.focus.title,
  stacked = false,
}: {
  items: CommandCenterView["todays_focus"];
  title?: string;
  stacked?: boolean;
}) {
  return (
    <DashboardPanel
      title={title}
      subtitle={bg.commandCenter.focus.subtitle}
      plainHeader
    >
      {items.length === 0 ? (
        <DashboardEmptyState>{bg.commandCenter.focus.empty}</DashboardEmptyState>
      ) : (
        <ol className={cn("grid gap-3", !stacked && "lg:grid-cols-2")}>
          {items.map((item) => (
            <li key={item.id}>
              <FocusTaskCard item={item} />
            </li>
          ))}
        </ol>
      )}
    </DashboardPanel>
  );
}

function FocusTaskCard({ item }: { item: CommandCenterView["todays_focus"][number] }) {
  const accent = getProjectAccentStyles(item.project_id);
  const roomLabel = item.instance_name ?? item.room_name ?? bg.common.empty;

  return (
    <ProjectColorProvider projectId={item.project_id}>
      <Link
        href={item.href}
        className={cn(
          "group flex items-stretch gap-4 p-4 pl-3.5",
          DASHBOARD_CARD_CLASS,
          DASHBOARD_CARD_INTERACTIVE_CLASS,
          accent.border,
          "border-l-[3px]"
        )}
      >
        <div className="grid min-w-0 flex-1 gap-3">
          <p className="truncate text-base font-semibold tracking-tight">{item.project_name}</p>

          <dl className="grid gap-2.5 text-sm">
            <FocusTaskField label={bg.commandCenter.focus.group} value={item.group_name} />
            <FocusTaskField label={bg.commandCenter.focus.stage} value={item.stage_name} />
            <FocusTaskField
              label={bg.studioDashboard.continueWorking.room}
              value={roomLabel}
            />
            <FocusTaskField
              label={bg.commandCenter.focus.remainingLabel}
              value={bg.commandCenter.focus.remaining(item.remaining_hours)}
              emphasize
            />
          </dl>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-between gap-3 self-stretch py-0.5">
          <PlannerScoreBadge
            projectId={item.project_id}
            score={item.priority_score}
            label={bg.commandCenter.focus.score}
          />
          <ChevronRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </div>
      </Link>
    </ProjectColorProvider>
  );
}

function FocusTaskField({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "truncate text-right text-sm",
          emphasize && "font-semibold tabular-nums"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function ActiveProjectsSection({
  projects,
  projectTimelines,
}: {
  projects: CommandCenterView["active_projects"];
  projectTimelines: Record<string, StudioTimelineStep[]>;
}) {
  return (
    <DashboardPanel title={bg.commandCenter.activeProjects.title}>
      {projects.length === 0 ? (
        <DashboardEmptyState>{bg.commandCenter.activeProjects.empty}</DashboardEmptyState>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {projects.map((project) => (
            <ProjectColorProvider key={project.id} projectId={project.id}>
              <ProjectAccent projectId={project.id}>
                <Link
                  href={project.href}
                  className="grid gap-5 rounded-xl border border-border/60 bg-background/80 p-5 pl-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-border hover:bg-background hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="grid gap-1">
                      <p className="text-lg font-semibold tracking-tight">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.project_number}</p>
                    </div>
                    <PlannerScoreBadge
                      projectId={project.id}
                      score={project.planner_score}
                      label={bg.commandCenter.activeProjects.plannerScore}
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {bg.commandCenter.activeProjects.progress}
                      </span>
                      <span className="font-medium tabular-nums">{project.progress_percent}%</span>
                    </div>
                    <ProgressBar
                      value={project.progress_percent}
                      variant="project"
                      projectId={project.id}
                      className="h-2.5"
                    />
                  </div>

                  <div className="grid gap-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {bg.commandCenter.activeProjects.currentGroup}
                    </p>
                    <StudioProjectTimeline
                      steps={projectTimelines[project.id] ?? []}
                      projectId={project.id}
                    />
                  </div>

                  <dl className="grid gap-3 border-t border-border/40 pt-4 text-sm sm:grid-cols-2">
                    <MetricRow
                      label={bg.commandCenter.activeProjects.currentStage}
                      value={project.current_stage_name ?? bg.common.empty}
                    />
                    <MetricRow
                      label={bg.commandCenter.activeProjects.remaining}
                      value={`${project.remaining_hours}${bg.common.hoursShort}`}
                    />
                    <MetricRow
                      label={bg.commandCenter.activeProjects.deadline}
                      value={project.deadline_label}
                      className="sm:col-span-2"
                    />
                  </dl>
                </Link>
              </ProjectAccent>
            </ProjectColorProvider>
          ))}
        </div>
      )}
    </DashboardPanel>
  );
}

function AtRiskSection({
  projects,
}: {
  projects: CommandCenterView["at_risk_projects"];
}) {
  return (
    <DashboardPanel
      title={bg.commandCenter.atRisk.title}
      subtitle={bg.commandCenter.atRisk.subtitle}
    >
      {projects.length === 0 ? (
        <DashboardEmptyState>{bg.commandCenter.atRisk.empty}</DashboardEmptyState>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => {
            const severity =
              project.risk_status === "overdue" || project.risk_status === "risk"
                ? resolveRiskSeverity({
                    risk_status: project.risk_status,
                    slack_days: project.slack_days,
                  })
                : "warning";
            const severityStyles = RISK_SEVERITY_STYLES[severity];

            return (
              <Link
                key={project.id}
                href={project.href}
                className={cn(
                  "grid gap-4 rounded-xl border-2 bg-background/80 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:grid-cols-[1fr_auto_auto_auto] sm:items-center",
                  severityStyles.border
                )}
              >
                <div className="grid gap-1">
                  <p className="font-semibold">{project.name}</p>
                  <p className="text-xs text-muted-foreground">{project.project_number}</p>
                </div>
                <div className="grid gap-1 text-sm">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {bg.commandCenter.atRisk.forecast}
                  </span>
                  <span>{project.forecast_finish_label}</span>
                </div>
                <div className="grid gap-1 text-sm">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {bg.commandCenter.atRisk.deadline}
                  </span>
                  <span>{project.deadline_label}</span>
                </div>
                <span
                  className={cn(
                    "inline-flex w-fit self-start rounded-full border px-3 py-1 text-xs font-medium sm:self-center sm:justify-self-end",
                    severityStyles.badge
                  )}
                >
                  {project.risk_status_label}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </DashboardPanel>
  );
}

function WaitingSection({
  items,
}: {
  items: CommandCenterView["waiting_groups"][number]["items"];
}) {
  return (
    <DashboardPanel title={bg.commandCenter.waiting.title}>
      {items.length === 0 ? (
        <DashboardEmptyState>{bg.commandCenter.waiting.empty}</DashboardEmptyState>
      ) : (
        <ul className="grid gap-4">
          {items.map((item) => (
            <li key={item.id}>
              <ProjectColorProvider projectId={item.project_id}>
                <ProjectAccent projectId={item.project_id}>
                  <Link
                    href={item.href}
                    className="grid gap-4 rounded-xl border border-border/60 bg-background/80 p-5 pl-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-border hover:bg-background hover:shadow-md lg:grid-cols-[minmax(0,1.2fr)_auto_auto_auto_auto] lg:items-center"
                  >
                    <div className="grid gap-1">
                      <p className="font-semibold">{item.project_name}</p>
                      <p className="text-sm text-muted-foreground">{item.stage_name}</p>
                    </div>
                    <WorkflowChip label={item.reason_label} />
                    <div className="grid gap-0.5 text-sm">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {bg.commandCenter.waiting.daysWaiting}
                      </span>
                      <span className="font-semibold tabular-nums">{item.days_waiting_label}</span>
                    </div>
                    <div className="grid gap-0.5 text-sm">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {bg.commandCenter.waiting.from}
                      </span>
                      <span>{item.started_at_label}</span>
                    </div>
                    <div className="grid gap-0.5 text-sm">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {bg.commandCenter.waiting.expectedDate}
                      </span>
                      <span>{item.expected_date_label ?? bg.common.empty}</span>
                    </div>
                  </Link>
                </ProjectAccent>
              </ProjectColorProvider>
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  );
}

function CapacitySection({
  capacity,
  stacked = false,
}: {
  capacity: CommandCenterView["capacity"];
  stacked?: boolean;
}) {
  const thisWeekLoad = calculateLoad(capacity.this_week_hours);
  const nextWeekLoad = calculateLoad(capacity.next_week_hours);
  const remainingLoad = calculateLoad(
    Math.min(capacity.total_remaining_hours, WEEKLY_CAPACITY_HOURS)
  );

  return (
    <DashboardPanel title={bg.commandCenter.capacity.title} plainHeader>
      <div className={cn("grid gap-5", stacked ? "grid-cols-1" : "lg:grid-cols-3")}>
        <CapacityBar
          label={bg.commandCenter.capacity.thisWeek}
          hoursLabel={bg.commandCenter.capacity.hours(capacity.this_week_hours)}
          value={thisWeekLoad}
          detail={`${capacity.this_week_hours} / ${WEEKLY_CAPACITY_HOURS}${bg.common.hoursShort}`}
        />
        <CapacityBar
          label={bg.commandCenter.capacity.nextWeek}
          hoursLabel={bg.commandCenter.capacity.hours(capacity.next_week_hours)}
          value={nextWeekLoad}
          detail={`${capacity.next_week_hours} / ${WEEKLY_CAPACITY_HOURS}${bg.common.hoursShort}`}
        />
        <CapacityBar
          label={bg.commandCenter.capacity.remainingHours}
          hoursLabel={bg.commandCenter.capacity.hours(capacity.total_remaining_hours)}
          value={remainingLoad}
          detail={bg.commandCenter.capacity.hours(capacity.total_remaining_hours)}
        />
      </div>
    </DashboardPanel>
  );
}

function CapacityBar({
  label,
  hoursLabel,
  value,
  detail,
}: {
  label: string;
  hoursLabel: string;
  value: number;
  detail: string;
}) {
  return (
    <article className={cn("grid gap-4 p-5", DASHBOARD_CARD_CLASS)}>
      <div className="flex items-end justify-between gap-3">
        <div className="grid gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight">{hoursLabel}</p>
        </div>
        <CapacityLoadLabel percent={value} className="text-sm" />
      </div>
      <ProgressBar value={Math.min(100, value)} variant="capacity" className="h-2.5" />
      <p className="text-xs text-muted-foreground">{detail}</p>
    </article>
  );
}

function RecentActivitySection({
  activity,
}: {
  activity: CommandCenterView["recent_activity"];
}) {
  const hasContent =
    activity.sessions.length > 0 ||
    activity.completed_stages.length > 0 ||
    activity.completed_projects.length > 0;

  return (
    <DashboardPanel title={bg.commandCenter.recentActivity.title}>
      {!hasContent ? (
        <DashboardEmptyState>{bg.commandCenter.recentActivity.empty}</DashboardEmptyState>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <ActivityList
            title={bg.commandCenter.recentActivity.sessions}
            items={activity.sessions.map((entry) => ({
              id: entry.id,
              href: entry.href,
              primary: entry.project_name,
              secondary: entry.context_label,
              meta: `${entry.time_label} · ${entry.worked_duration_label}`,
            }))}
          />
          <ActivityList
            title={bg.commandCenter.recentActivity.completedStages}
            items={activity.completed_stages.map((entry) => ({
              id: entry.id,
              href: entry.href,
              primary: entry.project_name,
              secondary: [entry.group_name, entry.stage_name, entry.instance_name]
                .filter(Boolean)
                .join(" · "),
              meta: entry.completed_at_label,
            }))}
          />
          <ActivityList
            title={bg.commandCenter.recentActivity.completedProjects}
            items={activity.completed_projects.map((entry) => ({
              id: entry.id,
              href: entry.href,
              primary: entry.name,
              secondary: entry.project_number,
              meta: entry.completed_at_label,
            }))}
          />
        </div>
      )}
    </DashboardPanel>
  );
}

function ActivityList({
  title,
  items,
}: {
  title: string;
  items: Array<{
    id: string;
    href: string;
    primary: string;
    secondary: string;
    meta: string;
  }>;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 rounded-xl border border-border/50 bg-background/50 p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="grid gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className="grid gap-1 rounded-lg px-3 py-3 transition-colors hover:bg-muted/30"
            >
              <span className="text-sm font-medium">{item.primary}</span>
              <span className="text-xs text-muted-foreground">{item.secondary}</span>
              <span className="text-xs tabular-nums text-muted-foreground">{item.meta}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MetricRow({
  label,
  value,
  emphasize = false,
  className,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-3", className)}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("text-right tabular-nums", emphasize && "font-semibold")}>{value}</dd>
    </div>
  );
}
