import Link from "next/link";
import {
  AlertCircleIcon,
  ArrowUpRightIcon,
  CheckCircle2Icon,
  CircleIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { PhaseStatus } from "@/features/phases/types/phase";
import type {
  WorkspaceRoomPhaseStep,
  WorkspaceRoomSummary,
} from "@/features/projects/types/project-workspace";
import { PhaseWorkSessionControls } from "@/features/work-sessions/components/phase-work-session-controls";
import type { WorkSession } from "@/features/work-sessions/types/work-session";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

interface RoomSummaryCardProps {
  projectId: string;
  room: WorkspaceRoomSummary;
  runningSession: WorkSession | null;
  currentPhaseActiveSession: WorkSession | null;
}

function phaseStatusLabel(status: PhaseStatus): string {
  return bg.labels.phaseStatus[status];
}

function resolveCurrentPhase(room: WorkspaceRoomSummary): WorkspaceRoomPhaseStep | null {
  return (
    room.phases.find((phase) => phase.is_current) ??
    room.phases.find((phase) => phase.status === "in_progress") ??
    null
  );
}

function PhaseTimelineIcon({ phase }: { phase: WorkspaceRoomPhaseStep }) {
  if (phase.status === "completed") {
    return <CheckCircle2Icon className="size-4 shrink-0 text-emerald-600" />;
  }

  if (phase.status === "blocked") {
    return <AlertCircleIcon className="size-4 shrink-0 text-amber-600" />;
  }

  if (phase.is_current) {
    return <CircleIcon className="size-4 shrink-0 fill-emerald-500 text-emerald-500" />;
  }

  return <CircleIcon className="size-4 shrink-0 text-muted-foreground/50" />;
}

function PhaseTimelineRow({ phase }: { phase: WorkspaceRoomPhaseStep }) {
  const isCurrent = phase.is_current;
  const isFuture = phase.status === "not_started" && !isCurrent;
  const isBlocked = phase.status === "blocked";

  return (
    <div
      className={cn(
        "relative flex gap-4 pl-1",
        isCurrent
          ? "rounded-xl bg-emerald-500/10 px-4 py-4 ring-1 ring-emerald-500/20"
          : isFuture
            ? "px-4 py-2 opacity-60"
            : "px-4 py-3"
      )}
    >
      <div className="flex flex-col items-center">
        <PhaseTimelineIcon phase={phase} />
        {!isCurrent ? (
          <span className="mt-1 w-px flex-1 bg-border/60" aria-hidden />
        ) : null}
      </div>

      <div className="grid min-w-0 flex-1 gap-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p
            className={cn(
              "font-medium",
              isCurrent ? "text-base" : "text-sm",
              isBlocked && "text-amber-800 dark:text-amber-200"
            )}
          >
            {phase.label}
          </p>
          {isCurrent ? (
            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
              {bg.room.current}
            </Badge>
          ) : null}
        </div>

        {isCurrent ? (
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{phaseStatusLabel(phase.status)}</span>
            <span>
              {bg.room.estimated} {phase.estimated_hours}
              {bg.common.hoursShort}
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>{phaseStatusLabel(phase.status)}</span>
            <span>
              {phase.estimated_hours}
              {bg.common.hoursShort}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function RoomSummaryCard({
  projectId,
  room,
  runningSession,
  currentPhaseActiveSession,
}: RoomSummaryCardProps) {
  const currentPhase = resolveCurrentPhase(room);

  return (
    <article
      className={cn(
        "flex flex-col gap-8 rounded-3xl bg-card p-8 shadow-sm",
        room.is_focus && "ring-2 ring-emerald-500/25",
        room.is_completed && "bg-emerald-500/[0.03]"
      )}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="grid gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-title">{room.name}</h3>
            <Badge variant="secondary">{room.room_kind_label}</Badge>
            {room.is_completed ? (
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                <CheckCircle2Icon className="size-3.5" />
                {bg.progress.roomCompleted}
              </Badge>
            ) : null}
          </div>
          <p className="text-sm font-medium tabular-nums text-muted-foreground">
            {bg.progress.phaseCount(room.completed_phases, room.total_phases)}
          </p>
        </div>
        <Link
          href={`/projects/${projectId}/rooms/${room.id}`}
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          aria-label={bg.projects.workspace.rooms.openRoom}
        >
          <ArrowUpRightIcon className="size-5 shrink-0" />
        </Link>
      </div>

      <div className="grid gap-3">
        <Progress value={room.progress_percent} className="h-3" />
      </div>

      {!room.is_completed && currentPhase ? (
        <div className="grid gap-2">
          <p className="text-eyebrow">{bg.projects.workspace.rooms.currentPhase}</p>
          <p className="text-section-title">{currentPhase.label}</p>
          <p className="text-body">{phaseStatusLabel(currentPhase.status)}</p>
        </div>
      ) : null}

      {!room.is_completed && currentPhase ? (
        <div className="rounded-2xl bg-muted/30 p-6">
          <PhaseWorkSessionControls
            projectId={projectId}
            roomId={room.id}
            phaseId={currentPhase.id}
            activeSession={currentPhaseActiveSession}
            runningSession={runningSession}
          />
        </div>
      ) : null}

      <div className="grid gap-1 border-t border-border/50 pt-6">
        <p className="text-eyebrow">{bg.projects.workspace.rooms.timelineTitle}</p>
        <div className="mt-4 grid gap-0">
          {room.phases.map((phase, index) => (
            <div key={phase.id} className="relative">
              {index < room.phases.length - 1 ? (
                <span
                  className="absolute top-6 left-[0.6875rem] h-[calc(100%-0.5rem)] w-px bg-border/60"
                  aria-hidden
                />
              ) : null}
              <PhaseTimelineRow phase={phase} />
            </div>
          ))}
        </div>
      </div>

      {room.next_phase_label ? (
        <p className="text-sm text-muted-foreground">
          {bg.projects.workspace.rooms.nextPhase}:{" "}
          <span className="font-medium text-foreground">{room.next_phase_label}</span>
        </p>
      ) : null}
    </article>
  );
}
