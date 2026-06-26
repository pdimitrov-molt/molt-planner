"use client";

import { useEffect, useState } from "react";

import {
  formatElapsedDuration,
  getElapsedSeconds,
} from "@/features/work-sessions/lib/format-elapsed-duration";
import { cn } from "@/lib/utils";

interface LiveWorkSessionTimerProps {
  startedAt: string;
  className?: string;
}

export function LiveWorkSessionTimer({
  startedAt,
  className,
}: LiveWorkSessionTimerProps) {
  const [elapsedLabel, setElapsedLabel] = useState(() =>
    formatElapsedDuration(getElapsedSeconds(startedAt))
  );

  useEffect(() => {
    function tick() {
      setElapsedLabel(formatElapsedDuration(getElapsedSeconds(startedAt)));
    }

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [startedAt]);

  return (
    <p
      className={cn(
        "font-mono text-3xl font-semibold tracking-tight tabular-nums",
        className
      )}
    >
      {elapsedLabel}
    </p>
  );
}
