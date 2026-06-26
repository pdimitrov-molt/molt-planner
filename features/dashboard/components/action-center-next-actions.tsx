import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ActionCenterAction } from "@/features/dashboard/lib/build-action-center";
import { bg } from "@/src/i18n/bg";

interface ActionCenterNextActionsProps {
  actions: ActionCenterAction[];
}

export function ActionCenterNextActions({ actions }: ActionCenterNextActionsProps) {
  return (
    <section className="grid gap-4">
      <div className="grid gap-1">
        <h2 className="text-title">{bg.actionCenter.nextActions.title}</h2>
        <p className="text-sm text-muted-foreground">
          {bg.actionCenter.nextActions.subtitle}
        </p>
      </div>

      {actions.length === 0 ? (
        <p className="rounded-xl bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {bg.actionCenter.nextActions.empty}
        </p>
      ) : (
        <ol className="grid gap-2">
          {actions.map((action, index) => (
            <li key={action.id}>
              <ActionRow action={action} rank={index + 1} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function ActionRow({
  action,
  rank,
}: {
  action: ActionCenterAction;
  rank: number;
}) {
  return (
    <article className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium tabular-nums text-muted-foreground">
        {rank}
      </span>

      <div className="grid min-w-0 flex-1 gap-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{action.display.title}</p>
          <ScopeBadge scope={action.display.scope} />
        </div>
        <p className="text-sm text-muted-foreground">{action.display.subtitle}</p>
        <p className="text-sm text-body">{action.recommended_action}</p>
      </div>

      <Button asChild size="sm" className="shrink-0 rounded-lg">
        <Link href={action.cta_href}>{action.cta_label}</Link>
      </Button>
    </article>
  );
}

function ScopeBadge({ scope }: { scope: "project" | "room" }) {
  return (
    <Badge variant="outline" className="text-xs font-normal">
      {scope === "project" ? bg.studioWorkflow.projectScope : bg.studioWorkflow.roomScope}
    </Badge>
  );
}
