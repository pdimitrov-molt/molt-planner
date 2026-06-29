"use client";

import { TimerIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { PhaseStatus } from "@/features/phases/types/phase";
import { cn } from "@/lib/utils";

const STATUS_CHIP_STYLES: Record<PhaseStatus, string> = {
  not_started: "border-border/60 bg-muted/40 text-muted-foreground",
  in_progress: "border-blue-500/30 bg-blue-500/10 text-blue-900 dark:text-blue-100",
  blocked: "border-orange-500/30 bg-orange-500/10 text-orange-900 dark:text-orange-100",
  completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100",
};

interface StatusChipProps {
  label: string;
  status?: PhaseStatus;
  isActiveTimer?: boolean;
  activeTimerLabel?: string;
  className?: string;
}

export function StatusChip({
  label,
  status,
  isActiveTimer = false,
  activeTimerLabel,
  className,
}: StatusChipProps) {
  if (isActiveTimer) {
    return (
      <Badge className={cn("gap-1 bg-emerald-600 text-white hover:bg-emerald-600", className)}>
        <TimerIcon className="size-3" />
        {activeTimerLabel ?? label}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-normal",
        status ? STATUS_CHIP_STYLES[status] : "border-border/60 bg-muted/30",
        className
      )}
    >
      {label}
    </Badge>
  );
}
