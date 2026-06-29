"use client";

import { resolveWaitingReasonStyles } from "@/features/studio-dashboard/lib/waiting-reason-styles";
import { cn } from "@/lib/utils";

interface WorkflowChipProps {
  label: string;
  className?: string;
}

export function WorkflowChip({ label, className }: WorkflowChipProps) {
  const styles = resolveWaitingReasonStyles(label);

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        styles.chip,
        className
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", styles.dot)} aria-hidden />
      {label}
    </span>
  );
}
