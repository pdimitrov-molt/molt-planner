import type { StudioSummaryCard } from "@/features/studio-dashboard/types/studio-dashboard-view";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

interface StudioSummaryCardsProps {
  cards: StudioSummaryCard[];
}

const ACCENT_STYLES: Record<StudioSummaryCard["accent"], string> = {
  green:
    "border-emerald-500/20 bg-emerald-500/5 text-emerald-800 dark:text-emerald-200",
  blue: "border-blue-500/20 bg-blue-500/5 text-blue-800 dark:text-blue-200",
  orange:
    "border-orange-500/20 bg-orange-500/5 text-orange-800 dark:text-orange-200",
  red: "border-red-500/20 bg-red-500/5 text-red-800 dark:text-red-200",
};

const VALUE_STYLES: Record<StudioSummaryCard["accent"], string> = {
  green: "text-emerald-700 dark:text-emerald-300",
  blue: "text-blue-700 dark:text-blue-300",
  orange: "text-orange-700 dark:text-orange-300",
  red: "text-red-700 dark:text-red-300",
};

const CARD_COPY: Record<
  StudioSummaryCard["id"],
  { title: string; hint?: string }
> = {
  active: {
    title: bg.studioDashboard.summary.activeProjects,
  },
  in_progress: {
    title: bg.studioDashboard.summary.inProgress,
    hint: bg.studioDashboard.summary.inProgressHint,
  },
  waiting: {
    title: bg.studioDashboard.summary.waiting,
    hint: bg.studioDashboard.summary.waitingHint,
  },
  overdue: {
    title: bg.studioDashboard.summary.overdue,
    hint: bg.studioDashboard.summary.overdueHint,
  },
};

export function StudioSummaryCards({ cards }: StudioSummaryCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const copy = CARD_COPY[card.id];

        return (
          <article
            key={card.id}
            className={cn(
              "rounded-2xl border px-4 py-4 shadow-sm",
              ACCENT_STYLES[card.accent]
            )}
          >
            <p className="text-xs font-medium uppercase tracking-wide opacity-80">
              {copy.title}
            </p>
            <div className="mt-3 flex items-end gap-2">
              <p
                className={cn(
                  "text-3xl font-semibold tabular-nums leading-none",
                  VALUE_STYLES[card.accent]
                )}
              >
                {card.value}
              </p>
              {card.total !== undefined ? (
                <p className="pb-0.5 text-sm opacity-70">
                  {bg.studioDashboard.summary.ofTotal(card.total)}
                </p>
              ) : null}
            </div>
            {copy.hint ? (
              <p className="mt-2 text-xs opacity-70">{copy.hint}</p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
