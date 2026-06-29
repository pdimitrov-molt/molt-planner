import type { StudioTimelineStep } from "@/features/studio-dashboard/types/studio-dashboard-view";
import { getProjectAccentStyles } from "@/features/studio-dashboard/lib/project-accent-colors";
import {
  timelineDotClassName,
  timelineLabelClassName,
  TIMELINE_LINE_STYLES,
} from "@/features/studio-dashboard/lib/timeline-styles";
import { cn } from "@/lib/utils";

interface StudioProjectTimelineProps {
  steps: StudioTimelineStep[];
  projectId?: string;
}

export function StudioProjectTimeline({ steps, projectId }: StudioProjectTimelineProps) {
  const accentStyles = projectId ? getProjectAccentStyles(projectId) : null;

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
                      resolveTimelineLineClass(step.state, accentStyles)
                    )}
                  />
                ) : (
                  <span className="flex-1" />
                )}
                <span className={resolveTimelineDotClass(step.state, accentStyles)} />
                {!isLast ? (
                  <span
                    className={cn(
                      "h-px flex-1",
                      resolveTimelineLineClass(nextState, accentStyles)
                    )}
                  />
                ) : (
                  <span className="flex-1" />
                )}
              </div>
              <p
                className={cn(
                  "max-w-full truncate text-center text-[11px] leading-tight",
                  resolveTimelineLabelClass(step.state, accentStyles)
                )}
              >
                {step.label}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function resolveTimelineDotClass(
  state: StudioTimelineStep["state"],
  accentStyles: ReturnType<typeof getProjectAccentStyles> | null
): string {
  if (state === "future") {
    return timelineDotClassName(state);
  }

  if (state === "waiting" || state === "overdue") {
    return timelineDotClassName(state);
  }

  if (accentStyles) {
    if (state === "completed") {
      return cn("size-2.5 shrink-0 rounded-full ring-4 ring-transparent", accentStyles.dotCompleted);
    }

    if (state === "current") {
      return cn(
        "size-2.5 shrink-0 rounded-full ring-4",
        accentStyles.dotCurrent,
        accentStyles.dotCurrentRing
      );
    }
  }

  return timelineDotClassName(state);
}

function resolveTimelineLineClass(
  state: StudioTimelineStep["state"],
  accentStyles: ReturnType<typeof getProjectAccentStyles> | null
): string {
  if (state === "waiting" || state === "overdue" || state === "future") {
    return TIMELINE_LINE_STYLES[state];
  }

  if (accentStyles) {
    if (state === "completed") {
      return accentStyles.lineCompleted;
    }

    if (state === "current") {
      return accentStyles.lineCurrent;
    }
  }

  return TIMELINE_LINE_STYLES[state];
}

function resolveTimelineLabelClass(
  state: StudioTimelineStep["state"],
  accentStyles: ReturnType<typeof getProjectAccentStyles> | null
): string {
  if (accentStyles) {
    if (state === "completed") {
      return accentStyles.labelCompleted;
    }

    if (state === "current") {
      return accentStyles.labelCurrent;
    }
  }

  return timelineLabelClassName(state);
}
