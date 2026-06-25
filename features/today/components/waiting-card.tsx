import Link from "next/link";
import { HourglassIcon } from "lucide-react";

import { InsetPanel, SurfaceCard } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { TodayWaitingItem } from "@/features/today/types/today-view";
import type { WaitingCategory } from "@/features/projects/types/project-workspace";
import { bg } from "@/src/i18n/bg";

interface WaitingCardProps {
  items: TodayWaitingItem[];
}

function waitingVariant(category: WaitingCategory) {
  switch (category) {
    case "client_approval":
      return "secondary" as const;
    case "supplier_waiting":
      return "outline" as const;
    default:
      return "destructive" as const;
  }
}

export function WaitingCard({ items }: WaitingCardProps) {
  return (
    <SurfaceCard className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-title">{bg.today.waiting.title}</h2>
        <p className="text-body">{bg.today.waiting.subtitle}</p>
      </div>

      {items.length === 0 ? (
        <Empty className="border-none p-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HourglassIcon />
            </EmptyMedia>
            <EmptyTitle>{bg.today.waiting.emptyTitle}</EmptyTitle>
            <EmptyDescription>{bg.today.waiting.emptyDescription}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="grid gap-4">
          {items.map((item) => (
            <li key={item.id}>
              <InsetPanel>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/projects/${item.project_id}`}
                      className="text-section-title hover:underline"
                    >
                      {item.title}
                    </Link>
                    <p className="text-body">{item.context}</p>
                    <p className="text-caption">
                      {item.project_name} · {item.room_name}
                    </p>
                  </div>
                  <Badge variant={waitingVariant(item.category)}>
                    {bg.labels.waitingCategory[item.category]}
                  </Badge>
                </div>
              </InsetPanel>
            </li>
          ))}
        </ul>
      )}
    </SurfaceCard>
  );
}
