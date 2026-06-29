"use client";

import {
  CAPACITY_LOAD_STYLES,
  getProjectAccentStyles,
  resolveCapacityLoadLevel,
} from "@/features/studio-dashboard/lib/project-accent-colors";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  trackClassName?: string;
  variant?: "default" | "project" | "capacity";
  projectId?: string;
}

export function ProgressBar({
  value,
  className,
  trackClassName,
  variant = "default",
  projectId,
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(value, 100));

  let indicatorClassName = "bg-primary";

  if (variant === "project" && projectId) {
    indicatorClassName = getProjectAccentStyles(projectId).progress;
  }

  if (variant === "capacity") {
    indicatorClassName = CAPACITY_LOAD_STYLES[resolveCapacityLoadLevel(clampedValue)].progress;
  }

  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
    >
      <div
        className={cn("h-full rounded-full transition-all", indicatorClassName, trackClassName)}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}

export function CapacityLoadLabel({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) {
  const level = resolveCapacityLoadLevel(percent);

  return (
    <span className={cn("font-medium tabular-nums", CAPACITY_LOAD_STYLES[level].text, className)}>
      {percent}%
    </span>
  );
}
