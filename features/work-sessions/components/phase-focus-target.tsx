"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface PhaseFocusTargetProps {
  phaseId: string;
  focusPhaseId?: string;
  children: React.ReactNode;
}

export function PhaseFocusTarget({
  phaseId,
  focusPhaseId,
  children,
}: PhaseFocusTargetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlighted, setHighlighted] = useState(false);

  useEffect(() => {
    if (!focusPhaseId || focusPhaseId !== phaseId) {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    container.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
    setHighlighted(true);

    const timeoutId = window.setTimeout(() => {
      setHighlighted(false);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [focusPhaseId, phaseId]);

  return (
    <div
      ref={containerRef}
      id={`phase-card-${phaseId}`}
      className={cn(
        "rounded-2xl transition-shadow duration-500",
        highlighted && "animate-phase-focus-pulse ring-2 ring-emerald-500/40"
      )}
    >
      {children}
    </div>
  );
}
