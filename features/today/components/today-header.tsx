import type { TodayView } from "@/features/today/types/today-view";
import { bg } from "@/src/i18n/bg";

interface TodayHeaderProps {
  view: TodayView;
}

export function TodayHeader({ view }: TodayHeaderProps) {
  return (
    <header className="flex flex-col gap-3">
      <p className="text-eyebrow capitalize">{view.date_label}</p>
      <h1 className="text-display">{bg.today.title}</h1>
      <p className="max-w-2xl text-body">{bg.today.subtitle(view.active_project_count)}</p>
    </header>
  );
}
