import { bg } from "@/src/i18n/bg";

export interface WorkflowChipStyles {
  chip: string;
  dot: string;
}

export const WAITING_REASON_CHIP_STYLES: Record<string, WorkflowChipStyles> = {
  [bg.workflowWaiting.reasons.client_approval]: {
    chip: "border-sky-500/30 bg-sky-500/12 text-sky-900 dark:text-sky-100",
    dot: "bg-sky-500",
  },
  [bg.workflowWaiting.reasons.presentation]: {
    chip: "border-violet-500/30 bg-violet-500/12 text-violet-900 dark:text-violet-100",
    dot: "bg-violet-500",
  },
  [bg.workflowWaiting.reasons.payment]: {
    chip: "border-emerald-500/30 bg-emerald-500/12 text-emerald-900 dark:text-emerald-100",
    dot: "bg-emerald-500",
  },
  [bg.workflowWaiting.reasons.measurements]: {
    chip: "border-cyan-500/30 bg-cyan-500/12 text-cyan-900 dark:text-cyan-100",
    dot: "bg-cyan-500",
  },
  [bg.workflowWaiting.reasons.supplier]: {
    chip: "border-amber-500/30 bg-amber-500/12 text-amber-900 dark:text-amber-100",
    dot: "bg-amber-500",
  },
  [bg.workflowWaiting.reasons.delivery]: {
    chip: "border-orange-500/30 bg-orange-500/12 text-orange-900 dark:text-orange-100",
    dot: "bg-orange-500",
  },
  [bg.workflowWaiting.reasons.contractor]: {
    chip: "border-stone-500/30 bg-stone-500/12 text-stone-900 dark:text-stone-100",
    dot: "bg-stone-500",
  },
  [bg.workflowWaiting.reasons.furniture_production]: {
    chip: "border-rose-500/30 bg-rose-500/12 text-rose-900 dark:text-rose-100",
    dot: "bg-rose-500",
  },
  [bg.workflowWaiting.reasons.other]: {
    chip: "border-slate-500/30 bg-slate-500/12 text-slate-900 dark:text-slate-100",
    dot: "bg-slate-500",
  },
};

export function resolveWaitingReasonStyles(reasonLabel: string): WorkflowChipStyles {
  return (
    WAITING_REASON_CHIP_STYLES[reasonLabel] ??
    WAITING_REASON_CHIP_STYLES[bg.workflowWaiting.reasons.other]
  );
}
