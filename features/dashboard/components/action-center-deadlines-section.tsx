import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { ActionCenterDeadline } from "@/features/dashboard/lib/build-action-center";
import { adaptWorkspaceItemDisplay } from "@/features/studio-workflow/lib/adapt-workspace-item-display";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

interface ActionCenterDeadlinesSectionProps {
  deadlines: ActionCenterDeadline[];
}

export function ActionCenterDeadlinesSection({
  deadlines,
}: ActionCenterDeadlinesSectionProps) {
  return (
    <section className="grid gap-4">
      <div className="grid gap-1">
        <h2 className="text-title">{bg.actionCenter.deadlines.title}</h2>
        <p className="text-sm text-muted-foreground">
          {bg.actionCenter.deadlines.subtitle}
        </p>
      </div>

      {deadlines.length === 0 ? (
        <p className="rounded-xl bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {bg.actionCenter.deadlines.empty}
        </p>
      ) : (
        <ul className="grid gap-2">
          {deadlines.map((deadline) => {
            const display = deadline.workspace_item
              ? adaptWorkspaceItemDisplay(deadline.workspace_item)
              : null;

            return (
            <li key={deadline.id}>
              <Link
                href={deadline.href}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 transition-colors hover:bg-muted/20",
                  deadline.is_overdue && "border-amber-500/30 bg-amber-500/5"
                )}
              >
                <div className="grid min-w-0 gap-0.5">
                  <p className="truncate text-sm font-medium">
                    {display?.title ?? deadline.project_name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {display?.subtitle ?? deadline.label}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {deadline.is_overdue ? (
                    <Badge variant="destructive" className="text-xs">
                      {bg.actionCenter.deadlines.overdue}
                    </Badge>
                  ) : null}
                  <span className="text-sm font-medium tabular-nums">
                    {deadline.date_label}
                  </span>
                </div>
              </Link>
            </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
