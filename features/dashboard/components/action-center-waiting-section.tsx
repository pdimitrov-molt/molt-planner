import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { ActionCenterWaitingItem } from "@/features/dashboard/lib/build-action-center";
import { adaptWorkspaceItemDisplay } from "@/features/studio-workflow/lib/adapt-workspace-item-display";
import { bg } from "@/src/i18n/bg";

interface ActionCenterWaitingSectionProps {
  items: ActionCenterWaitingItem[];
}

export function ActionCenterWaitingSection({
  items,
}: ActionCenterWaitingSectionProps) {
  return (
    <section className="grid gap-4">
      <div className="grid gap-1">
        <h2 className="text-title">{bg.actionCenter.waiting.title}</h2>
        <p className="text-sm text-muted-foreground">
          {bg.actionCenter.waiting.subtitle}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {bg.actionCenter.waiting.empty}
        </p>
      ) : (
        <ul className="grid gap-2">
          {items.map((item) => {
            const display = item.workspace_item
              ? adaptWorkspaceItemDisplay(item.workspace_item)
              : null;

            return (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 transition-colors hover:bg-muted/20"
              >
                <div className="grid min-w-0 gap-1">
                  <p className="text-sm font-medium">
                    {display?.title ?? item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {display?.subtitle ?? item.context}
                  </p>
                  {!display ? (
                    <p className="text-xs text-muted-foreground">
                      {item.project_name} · {item.room_name}
                    </p>
                  ) : null}
                </div>
                <Badge
                  variant={item.kind === "blocked" ? "destructive" : "secondary"}
                  className="shrink-0"
                >
                  {item.kind === "blocked"
                    ? bg.actionCenter.waiting.blocked
                    : bg.actionCenter.waiting.paused}
                </Badge>
              </Link>
            </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
