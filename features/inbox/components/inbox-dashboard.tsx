"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRightIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-shell";
import {
  DashboardEmptyState,
  DashboardPanel,
  DASHBOARD_CARD_CLASS,
  DASHBOARD_CARD_INTERACTIVE_CLASS,
} from "@/features/studio-dashboard/components/dashboard-ui";
import {
  PlannerScoreBadge,
  ProjectColorProvider,
} from "@/features/studio-dashboard/components/visual-identity";
import { filterInboxItems } from "@/features/inbox/lib/build-inbox-view";
import type {
  InboxFilter,
  InboxItem,
  InboxItemKind,
  InboxView,
} from "@/features/inbox/types/inbox-view";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

interface InboxDashboardProps {
  view: InboxView;
}

const FILTER_OPTIONS: InboxFilter[] = ["all", "project", "personal", "waiting"];

const KIND_STYLES: Record<
  InboxItemKind,
  { badge: string; border: string }
> = {
  project: {
    badge: "bg-[#35D07F]/15 text-[#35D07F]",
    border: "border-l-[#35D07F]",
  },
  personal: {
    badge: "bg-[#8B5CF6]/15 text-[#C4B5FD]",
    border: "border-l-[#8B5CF6]",
  },
  waiting: {
    badge: "bg-[#F59E0B]/15 text-[#FCD34D]",
    border: "border-l-[#F59E0B]",
  },
};

function kindLabel(kind: InboxItemKind): string {
  return bg.inbox.kinds[kind];
}

function filterLabel(filter: InboxFilter): string {
  return bg.inbox.filters[filter];
}

export function InboxDashboard({ view }: InboxDashboardProps) {
  const [filter, setFilter] = useState<InboxFilter>("all");

  const filteredItems = useMemo(
    () => filterInboxItems(view.items, filter),
    [filter, view.items]
  );

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Studio OS"
        title={bg.inbox.title}
        description={bg.inbox.subtitle}
      />

      <DashboardPanel title={bg.inbox.filters.title} plainHeader>
        <div className="grid gap-4">
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((option) => {
              const isActive = filter === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "border-border/60 bg-background/60 text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                >
                  {filterLabel(option)}
                  <span className="ml-1.5 tabular-nums text-xs opacity-70">
                    ({view.counts[option]})
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground">{bg.inbox.readOnlyHint}</p>
        </div>
      </DashboardPanel>

      {view.items.length === 0 ? (
        <DashboardEmptyState>{bg.inbox.empty}</DashboardEmptyState>
      ) : filteredItems.length === 0 ? (
        <DashboardEmptyState>{bg.inbox.noResults}</DashboardEmptyState>
      ) : (
        <DashboardPanel title={bg.inbox.listTitle} plainHeader>
          <div className="grid gap-3">
            <div className="hidden grid-cols-[minmax(0,1fr)_5.5rem_6.5rem_5.5rem] gap-3 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
              <span>{bg.inbox.columns.item}</span>
              <span className="text-right">{bg.inbox.columns.score}</span>
              <span className="text-right">{bg.inbox.columns.deadline}</span>
              <span className="text-right">{bg.inbox.columns.priority}</span>
            </div>

            {filteredItems.map((item) => (
              <InboxItemRow key={item.id} item={item} />
            ))}
          </div>
        </DashboardPanel>
      )}
    </div>
  );
}

function InboxItemRow({ item }: { item: InboxItem }) {
  const styles = KIND_STYLES[item.kind];

  const content = (
    <Link
      href={item.href}
      className={cn(
        DASHBOARD_CARD_CLASS,
        DASHBOARD_CARD_INTERACTIVE_CLASS,
        "group grid gap-4 border-l-[3px] p-4 md:grid-cols-[minmax(0,1fr)_5.5rem_6.5rem_5.5rem] md:items-center",
        styles.border
      )}
    >
      <div className="grid min-w-0 gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
              styles.badge
            )}
          >
            {kindLabel(item.kind)}
          </span>
          {item.status_label ? (
            <span className="text-xs text-muted-foreground">{item.status_label}</span>
          ) : null}
        </div>
        <p className="truncate text-base font-semibold tracking-tight">{item.title}</p>
        <p className="truncate text-sm text-muted-foreground">{item.subtitle}</p>
      </div>

      <div className="flex items-center justify-between gap-3 md:justify-end">
        <span className="text-xs text-muted-foreground md:hidden">
          {bg.inbox.columns.score}
        </span>
        {item.kind === "project" && item.project_id ? (
          <PlannerScoreBadge
            projectId={item.project_id}
            score={item.planner_score}
            label={bg.inbox.columns.score}
            size="sm"
          />
        ) : (
          <InboxScoreValue score={item.planner_score} />
        )}
      </div>

      <div className="grid gap-0.5 md:text-right">
        <span className="text-xs text-muted-foreground md:hidden">
          {bg.inbox.columns.deadline}
        </span>
        <span className="text-sm font-medium tabular-nums">
          {item.deadline_label ?? bg.common.empty}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 md:justify-end">
        <div className="grid gap-0.5 md:text-right">
          <span className="text-xs text-muted-foreground md:hidden">
            {bg.inbox.columns.priority}
          </span>
          <span className="text-sm font-medium">{item.priority_label}</span>
        </div>
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );

  if (item.project_id) {
    return <ProjectColorProvider projectId={item.project_id}>{content}</ProjectColorProvider>;
  }

  return content;
}

function InboxScoreValue({ score }: { score: number }) {
  return (
    <div className="grid shrink-0 gap-0.5 rounded-lg border border-border/60 bg-muted/20 px-2.5 py-1.5 text-right">
      <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
        {bg.inbox.columns.score}
      </span>
      <span className="text-lg font-semibold tabular-nums leading-none text-foreground">
        {score > 0 ? score : bg.common.empty}
      </span>
    </div>
  );
}
