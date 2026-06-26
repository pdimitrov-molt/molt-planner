import type { StudioTimelineStepState } from "@/features/studio-dashboard/types/studio-dashboard-view";
import { cn } from "@/lib/utils";

export const TIMELINE_DOT_STYLES: Record<StudioTimelineStepState, string> = {
  completed: "bg-emerald-500 ring-emerald-500/20",
  current: "bg-blue-500 ring-blue-500/20",
  waiting: "bg-orange-500 ring-orange-500/20",
  overdue: "bg-red-500 ring-red-500/20",
  future: "bg-muted-foreground/30 ring-border",
};

export const TIMELINE_LABEL_STYLES: Record<StudioTimelineStepState, string> = {
  completed: "text-emerald-700 dark:text-emerald-300",
  current: "text-blue-700 dark:text-blue-300 font-medium",
  waiting: "text-orange-700 dark:text-orange-300",
  overdue: "text-red-700 dark:text-red-300 font-medium",
  future: "text-muted-foreground",
};

export const TIMELINE_LINE_STYLES: Record<StudioTimelineStepState, string> = {
  completed: "bg-emerald-500/40",
  current: "bg-blue-500/40",
  waiting: "bg-orange-500/40",
  overdue: "bg-red-500/40",
  future: "bg-border",
};

export function timelineDotClassName(state: StudioTimelineStepState): string {
  return cn("size-2.5 shrink-0 rounded-full ring-4", TIMELINE_DOT_STYLES[state]);
}

export function timelineLabelClassName(state: StudioTimelineStepState): string {
  return cn("text-[11px] leading-tight", TIMELINE_LABEL_STYLES[state]);
}
