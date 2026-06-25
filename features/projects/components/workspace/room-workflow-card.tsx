import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  WorkspaceRoomPhaseStep,
  WorkspaceRoomSummary,
} from "@/features/projects/types/project-workspace";
import type { PhaseStatus } from "@/features/phases/types/phase";
import { bg } from "@/src/i18n/bg";

interface RoomWorkflowCardProps {
  projectId: string;
  room: WorkspaceRoomSummary;
}

function phaseStepClass(status: PhaseStatus, isCurrent: boolean) {
  if (isCurrent) {
    return "border-primary bg-primary text-primary-foreground";
  }

  switch (status) {
    case "completed":
      return "border-primary/30 bg-primary/10 text-primary";
    case "blocked":
      return "border-destructive/40 bg-destructive/10 text-destructive";
    case "in_progress":
      return "border-primary/40 bg-primary/5 text-foreground";
    default:
      return "border-border bg-muted/30 text-muted-foreground";
  }
}

function PhasePipeline({ phases }: { phases: WorkspaceRoomPhaseStep[] }) {
  return (
    <ol className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-0">
      {phases.map((phase, index) => (
        <li
          key={phase.id}
          className={cn(
            "flex min-w-0 flex-1 flex-col gap-2 sm:px-1",
            index === 0 ? "sm:pl-0" : "",
            index === phases.length - 1 ? "sm:pr-0" : ""
          )}
        >
          <div
            className={cn(
              "rounded-xl border px-3 py-2.5 text-center transition-colors",
              phaseStepClass(phase.status, phase.is_current)
            )}
          >
            <p className="truncate text-xs font-medium">{phase.label}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wide opacity-80">
              {bg.labels.phaseStatus[phase.status]}
            </p>
          </div>
          {index < phases.length - 1 ? (
            <div
              aria-hidden
              className="mx-auto hidden h-px w-full max-w-[24px] bg-border sm:block"
            />
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export function RoomWorkflowCard({ projectId, room }: RoomWorkflowCardProps) {
  return (
      <Link
        href={`/projects/${projectId}/rooms/${room.id}`}
        className={cn(
          "surface-card-interactive group flex flex-col gap-6 p-6",
          room.is_focus ? "ring-1 ring-primary/20" : ""
        )}
      >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-section-title">{room.name}</h3>
            <Badge variant="secondary">{room.room_kind_label}</Badge>
            {room.is_focus ? (
              <Badge variant="default">{bg.projects.workspace.rooms.focusBadge}</Badge>
            ) : null}
          </div>
          <p className="text-body">{room.priority} · {bg.projects.workspace.rooms.remainingHours(room.remaining_hours)}</p>
        </div>
        <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>

      <div className="grid gap-3">
        <p className="text-eyebrow">{bg.projects.workspace.rooms.phases}</p>
        <PhasePipeline phases={room.phases} />
      </div>

      <p className="text-sm font-medium text-primary">
        {bg.projects.workspace.rooms.openRoom}
      </p>
    </Link>
  );
}
