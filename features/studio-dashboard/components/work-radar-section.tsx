"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DASHBOARD_CARD_CLASS,
  DASHBOARD_CARD_INTERACTIVE_CLASS,
  DashboardEmptyState,
  DashboardPanel,
} from "@/features/studio-dashboard/components/dashboard-ui";
import {
  PlannerScoreBadge,
  ProjectColorProvider,
  WorkflowChip,
} from "@/features/studio-dashboard/components/visual-identity";
import { LiveWorkSessionTimer } from "@/features/work-sessions/components/live-work-session-timer";
import {
  RISK_SEVERITY_STYLES,
  resolveRiskSeverity,
} from "@/features/studio-dashboard/lib/project-accent-colors";
import type {
  CommandCenterAtRiskProject,
  CommandCenterContinueWorking,
  CommandCenterFocusItem,
  CommandCenterWaitingItem,
} from "@/features/studio-dashboard/types/command-center-view";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

const INTERACTIVE_CARD = cn(DASHBOARD_CARD_CLASS, DASHBOARD_CARD_INTERACTIVE_CLASS, "relative pl-5");

const RADAR_ACCENT = {
  now: "border-l-[4px] border-l-[#35D07F]",
  next: "border-l-[3px] border-l-[#3B82F6]",
  waiting: "border-l-[3px] border-l-[#F59E0B]",
  risk: "border-l-[3px] border-l-[#EF4444]",
} as const;

interface WorkRadarSectionProps {
  nowItem: CommandCenterFocusItem | null;
  nextItems: CommandCenterFocusItem[];
  waitingItems: CommandCenterWaitingItem[];
  riskProjects: CommandCenterAtRiskProject[];
  continueWorking: CommandCenterContinueWorking | null;
}

export function WorkRadarSection({
  nowItem,
  nextItems,
  waitingItems,
  riskProjects,
  continueWorking,
}: WorkRadarSectionProps) {
  const topWaitingItem = waitingItems[0] ?? null;
  const topRiskProjects = riskProjects.slice(0, 3);
  const visibleNextItems = nextItems.slice(0, 2);

  return (
    <DashboardPanel title={bg.commandCenter.workRadar.title} plainHeader className="gap-5">
      <div className="grid gap-5">
        <NowBlock
          item={nowItem}
          continueWorking={continueWorking}
        />
        <NextBlock items={visibleNextItems} />
        {topWaitingItem ? <WaitingBlock item={topWaitingItem} /> : null}
        {topRiskProjects.length > 0 ? (
          <RiskBlock projects={topRiskProjects} />
        ) : null}
      </div>
    </DashboardPanel>
  );
}

function RadarAccentCard({
  accent,
  className,
  children,
}: {
  accent: keyof typeof RADAR_ACCENT;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn(INTERACTIVE_CARD, RADAR_ACCENT[accent], className)}>
      {children}
    </div>
  );
}

function NowBlock({
  item,
  continueWorking,
}: {
  item: CommandCenterFocusItem | null;
  continueWorking: CommandCenterContinueWorking | null;
}) {
  const actionHref = continueWorking?.href ?? item?.href ?? null;
  const actionLabel = continueWorking
    ? bg.commandCenter.workRadar.continueWorking
    : bg.commandCenter.workRadar.startWork;

  return (
    <div className="grid gap-3">
      <RadarBlockLabel label={bg.commandCenter.workRadar.now} accent="now" />

      {!item ? (
        <DashboardEmptyState>{bg.commandCenter.workRadar.emptyNow}</DashboardEmptyState>
      ) : (
        <ProjectColorProvider projectId={item.project_id}>
          <RadarAccentCard
            accent="now"
            className="grid min-h-[17rem] gap-8 bg-[#35D07F]/[0.04] p-8 lg:grid-cols-[1fr_auto] lg:items-center"
          >
            <Link href={item.href} className="grid gap-6">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="grid min-w-0 gap-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    {bg.commandCenter.focus.project}
                  </p>
                  <p className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    {item.project_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{item.project_number}</p>
                </div>
                <PlannerScoreBadge
                  projectId={item.project_id}
                  score={item.priority_score}
                  label={bg.commandCenter.focus.score}
                  size="xl"
                />
              </div>

              {continueWorking ? (
                <LiveWorkSessionTimer
                  startedAt={continueWorking.started_at}
                  className="text-4xl font-semibold tabular-nums text-[#35D07F]"
                />
              ) : null}

              <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <RadarDetail label={bg.commandCenter.focus.group} value={item.group_name} />
                <RadarDetail label={bg.commandCenter.focus.stage} value={item.stage_name} large />
                <RadarDetail
                  label={bg.commandCenter.workRadar.roomOrDocument}
                  value={item.instance_name ?? item.room_name ?? bg.common.empty}
                />
                <RadarDetail
                  label={bg.commandCenter.focus.remainingLabel}
                  value={bg.commandCenter.focus.remaining(item.remaining_hours)}
                  emphasize
                />
              </dl>
            </Link>

            {actionHref ? (
              <Button asChild size="lg" className="h-16 rounded-[1.125rem] px-10 text-lg font-semibold">
                <Link href={actionHref}>{actionLabel}</Link>
              </Button>
            ) : null}
          </RadarAccentCard>
        </ProjectColorProvider>
      )}
    </div>
  );
}

function NextBlock({ items }: { items: CommandCenterFocusItem[] }) {
  return (
    <div className="grid gap-3">
      <RadarBlockLabel label={bg.commandCenter.workRadar.next} accent="next" />

      {items.length === 0 ? (
        <DashboardEmptyState className="py-8">
          {bg.commandCenter.workRadar.emptyNext}
        </DashboardEmptyState>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => {
            const contextLabel = item.instance_name ?? item.room_name;

            return (
              <li key={item.id}>
                <ProjectColorProvider projectId={item.project_id}>
                  <Link href={item.href} className="block h-full">
                    <RadarAccentCard accent="next" className="group grid h-full gap-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold leading-snug">{item.project_name}</p>
                        <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                          #{item.rank}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.group_name}</p>
                      <p className="text-sm font-medium">{item.stage_name}</p>
                      {contextLabel ? (
                        <p className="text-xs text-muted-foreground">{contextLabel}</p>
                      ) : null}
                      <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-sm">
                        <span className="tabular-nums text-muted-foreground">
                          {bg.commandCenter.focus.remaining(item.remaining_hours)}
                        </span>
                        <span className="font-semibold tabular-nums">{item.priority_score}</span>
                      </div>
                    </RadarAccentCard>
                  </Link>
                </ProjectColorProvider>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function WaitingBlock({ item }: { item: CommandCenterWaitingItem }) {
  return (
    <div className="grid gap-3">
      <RadarBlockLabel label={bg.commandCenter.workRadar.waiting} accent="waiting" />

      <ProjectColorProvider projectId={item.project_id}>
        <Link href={item.href} className="block">
          <RadarAccentCard
            accent="waiting"
            className="group grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center"
          >
            <div className="grid gap-2">
              <p className="text-lg font-semibold">{item.project_name}</p>
              <p className="text-sm text-muted-foreground">{item.stage_name}</p>
              <WorkflowChip label={item.reason_label} />
            </div>
            <dl className="grid gap-3 text-sm sm:text-right">
              <div>
                <dt className="text-xs text-muted-foreground">
                  {bg.commandCenter.waiting.daysWaiting}
                </dt>
                <dd className="text-base font-semibold tabular-nums">{item.days_waiting_label}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  {bg.commandCenter.waiting.expectedDate}
                </dt>
                <dd>{item.expected_date_label ?? bg.common.empty}</dd>
              </div>
            </dl>
          </RadarAccentCard>
        </Link>
      </ProjectColorProvider>
    </div>
  );
}

function RiskBlock({ projects }: { projects: CommandCenterAtRiskProject[] }) {
  return (
    <div className="grid gap-3">
      <RadarBlockLabel label={bg.commandCenter.workRadar.risk} accent="risk" />

      <ul className="grid gap-3 sm:grid-cols-2">
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
            <li key={project.id}>
              <Link href={project.href} className="block h-full">
                <RadarAccentCard accent="risk" className="group grid h-full gap-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid gap-1">
                      <p className="font-semibold">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.project_number}</p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                        severityStyles.badge
                      )}
                    >
                      {project.risk_status_label}
                    </span>
                  </div>
                  <dl className="grid gap-2 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        {bg.commandCenter.atRisk.deadline}
                      </dt>
                      <dd>{project.deadline_label}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        {bg.commandCenter.atRisk.forecast}
                      </dt>
                      <dd>{project.forecast_finish_label}</dd>
                    </div>
                  </dl>
                </RadarAccentCard>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RadarBlockLabel({
  label,
  accent,
}: {
  label: string;
  accent: keyof typeof RADAR_ACCENT;
}) {
  const accentBar = {
    now: "bg-[#35D07F]",
    next: "bg-[#3B82F6]",
    waiting: "bg-[#F59E0B]",
    risk: "bg-[#EF4444]",
  } as const;

  return (
    <div className="flex items-center gap-2">
      <span className={cn("h-3.5 w-1 rounded-full", accentBar[accent])} aria-hidden />
      <p className="text-sm font-semibold text-foreground">{label}</p>
    </div>
  );
}

function RadarDetail({
  label,
  value,
  large = false,
  emphasize = false,
}: {
  label: string;
  value: string;
  large?: boolean;
  emphasize?: boolean;
}) {
  return (
    <div className="grid gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          large && "text-xl font-semibold leading-snug",
          emphasize && "text-lg font-semibold tabular-nums",
          !large && !emphasize && "text-sm"
        )}
      >
        {value}
      </dd>
    </div>
  );
}
