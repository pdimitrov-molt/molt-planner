import type { StudioTimelineStep } from "@/features/studio-dashboard/types/studio-dashboard-view";
import {
  timelineDotClassName,
  timelineLabelClassName,
  TIMELINE_LINE_STYLES,
} from "@/features/studio-dashboard/lib/timeline-styles";
import { cn } from "@/lib/utils";

interface StudioProjectTimelineProps {
  steps: StudioTimelineStep[];
}

export function StudioProjectTimeline({ steps }: StudioProjectTimelineProps) {
  if (steps.length === 0) {
    return (
      <div className="flex h-10 items-center text-xs text-muted-foreground">
        —
      </div>
    );
  }

  return (
    <div className="min-w-0 overflow-x-auto">
      <ol className="flex min-w-max items-start gap-0 px-1">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const nextState = steps[index + 1]?.state ?? step.state;

          return (
            <li key={step.id} className="flex min-w-[4.5rem] max-w-[5.5rem] flex-col items-center gap-2">
              <div className="flex w-full items-center">
                {index > 0 ? (
                  <span
                    className={cn(
                      "h-px flex-1",
                      TIMELINE_LINE_STYLES[step.state]
                    )}
                  />
                ) : (
                  <span className="flex-1" />
                )}
                <span className={timelineDotClassName(step.state)} />
                {!isLast ? (
                  <span
                    className={cn(
                      "h-px flex-1",
                      TIMELINE_LINE_STYLES[nextState]
                    )}
                  />
                ) : (
                  <span className="flex-1" />
                )}
              </div>
              <p className={cn("max-w-full truncate text-center", timelineLabelClassName(step.state))}>
                {step.label}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
