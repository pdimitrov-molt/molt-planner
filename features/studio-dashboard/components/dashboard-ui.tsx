import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const DASHBOARD_PANEL_CLASS =
  "grid gap-6 rounded-[1.125rem] border border-border bg-card p-6 shadow-[var(--card-shadow)]";

export const DASHBOARD_CARD_CLASS =
  "rounded-[1.125rem] border border-border/60 bg-background/80 shadow-[var(--card-shadow)]";

export const DASHBOARD_CARD_INTERACTIVE_CLASS =
  "transition-[transform,box-shadow,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-border hover:bg-background hover:shadow-[var(--card-shadow)]";

export function DashboardPanel({
  title,
  subtitle,
  children,
  className,
  plainHeader = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  plainHeader?: boolean;
}) {
  return (
    <section className={cn(DASHBOARD_PANEL_CLASS, "min-w-0", className)}>
      <header
        className={cn(
          "grid gap-1",
          !plainHeader && "border-b border-border/50 pb-4"
        )}
      >
        <h2 className="text-section-title">{title}</h2>
        {subtitle ? <p className="text-caption">{subtitle}</p> : null}
      </header>
      {children}
    </section>
  );
}

export function DashboardEmptyState({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[1.125rem] border border-dashed border-border/60 bg-muted/15 px-6 py-10 text-center",
        className
      )}
    >
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}
