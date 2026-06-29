"use client";

import type { ReactNode } from "react";

import { useProjectColorOptional } from "@/features/studio-dashboard/components/visual-identity/project-color-provider";
import { cn } from "@/lib/utils";

interface ProjectAccentProps {
  projectId: string;
  children: ReactNode;
  className?: string;
  variant?: "border" | "strip" | "surface";
}

export function ProjectAccent({
  projectId,
  children,
  className,
  variant = "border",
}: ProjectAccentProps) {
  const { styles } = useProjectColorOptional(projectId);

  if (variant === "strip") {
    return (
      <div className={cn("relative overflow-hidden rounded-xl", className)}>
        <span
          className={cn("absolute inset-y-0 left-0 w-1", styles.strip)}
          aria-hidden
        />
        <div className="pl-1">{children}</div>
      </div>
    );
  }

  if (variant === "surface") {
    return (
      <div className={cn("rounded-xl", styles.softSurface, className)}>{children}</div>
    );
  }

  return (
    <div className={cn("border-l-4", styles.border, className)}>{children}</div>
  );
}
