"use client";

import { useProjectColorOptional } from "@/features/studio-dashboard/components/visual-identity/project-color-provider";
import { cn } from "@/lib/utils";

interface PlannerScoreBadgeProps {
  projectId: string;
  score: number;
  label: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZE_STYLES = {
  sm: {
    wrapper: "px-2.5 py-1.5",
    label: "text-[9px]",
    value: "text-lg",
  },
  md: {
    wrapper: "px-3 py-2",
    label: "text-[10px]",
    value: "text-xl",
  },
  lg: {
    wrapper: "px-3.5 py-2.5",
    label: "text-[10px]",
    value: "text-2xl",
  },
  xl: {
    wrapper: "px-4 py-3",
    label: "text-xs",
    value: "text-3xl",
  },
} as const;

export function PlannerScoreBadge({
  projectId,
  score,
  label,
  className,
  size = "md",
}: PlannerScoreBadgeProps) {
  const { styles } = useProjectColorOptional(projectId);
  const sizeStyles = SIZE_STYLES[size];

  return (
    <div
      className={cn(
        "grid shrink-0 gap-0.5 rounded-lg border text-right",
        styles.badge,
        sizeStyles.wrapper,
        className
      )}
    >
      <span
        className={cn(
          "font-medium uppercase tracking-wide opacity-80",
          styles.badgeText,
          sizeStyles.label
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "font-semibold tabular-nums leading-none",
          styles.badgeText,
          sizeStyles.value
        )}
      >
        {score}
      </span>
    </div>
  );
}
