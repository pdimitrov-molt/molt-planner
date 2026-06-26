import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2Icon } from "lucide-react";

import { InsetPanel, PageShell, SurfaceCard } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CompletePhaseButton } from "@/features/phases/components/complete-phase-button";
import type { PhaseStatus } from "@/features/phases/types/phase";
import { getRoomWorkspaceService } from "@/features/rooms/service/room-workspace.service";
import { PhaseWorkSessionControls } from "@/features/work-sessions/components/phase-work-session-controls";
import { PhaseWorkSessionHistory } from "@/features/work-sessions/components/phase-work-session-history";
import { PhaseFocusTarget } from "@/features/work-sessions/components/phase-focus-target";
import { getActivePhaseSession } from "@/features/work-sessions/lib/get-active-phase-session";
import { getWorkSessionService } from "@/features/work-sessions/service/get-work-session-service";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

interface RoomWorkspaceViewProps {
  projectId: string;
  roomId: string;
  focusPhaseId?: string;
}

function phaseVariant(status: string) {
  switch (status) {
    case "blocked":
      return "destructive" as const;
    case "in_progress":
      return "default" as const;
    case "completed":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

function phaseStatusLabel(status: PhaseStatus): string {
  return bg.labels.phaseStatus[status];
}

export async function RoomWorkspaceView({
  projectId,
  roomId,
  focusPhaseId,
}: RoomWorkspaceViewProps) {
  const service = await getRoomWorkspaceService();
  const workSessionService = await getWorkSessionService();
  const room = await service.getRoomWorkspace(projectId, roomId);

  if (!room) {
    notFound();
  }

  const [runningSession, phaseSessionGroups, phaseHistoryGroups] = await Promise.all([
    workSessionService.findRunningSession(),
    Promise.all(
      room.phases.map((phase) =>
        workSessionService.findByPhase({ phase_id: phase.id })
      )
    ),
    Promise.all(room.phases.map((phase) => workSessionService.getPhaseHistory(phase.id))),
  ]);

  const currentPhase = room.phases.find((phase) => phase.is_current);

  return (
    <main className="min-h-screen">
      <PageShell width="lg">
        <header className="flex flex-col gap-6">
          <Link
            href={`/projects/${projectId}`}
            className="text-body transition-colors hover:text-foreground"
          >
            {bg.projects.workspace.backToProject(room.project_name)}
          </Link>

          <SurfaceCard className="rounded-2xl shadow-sm">
            <div className="flex flex-col gap-8">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-display">{room.name}</h1>
                    <Badge variant="secondary">{room.room_kind_label}</Badge>
                    {room.is_completed ? (
                      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                        <CheckCircle2Icon className="size-3.5" />
                        {bg.progress.roomCompleted}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-body">
                    {bg.room.projectLabel}:{" "}
                    <span className="font-medium text-foreground">
                      {room.project_name}
                    </span>
                  </p>
                </div>

                <div className="grid min-w-48 gap-1 text-right text-sm">
                  <span className="text-muted-foreground">{bg.room.remainingHours}</span>
                  <span className="text-2xl font-semibold tracking-tight">
                    {room.remaining_hours}
                    {bg.common.hoursShort}
                  </span>
                </div>
              </div>

              {room.scope_summary ? (
                <p className="text-body">{room.scope_summary}</p>
              ) : null}

              <div className="grid max-w-xl gap-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{bg.room.progress}</span>
                  <span className="font-medium">{room.progress_percent}%</span>
                </div>
                <Progress value={room.progress_percent} />
                <p className="text-sm text-muted-foreground">
                  {bg.progress.phaseCount(room.completed_phases, room.total_phases)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {bg.room.currentPhase}:{" "}
                  <strong>
                    {room.is_completed
                      ? bg.progress.roomCompleted
                      : room.current_phase_label || bg.common.notStarted}
                  </strong>
                </p>
                {currentPhase && !room.is_completed ? (
                  <CompletePhaseButton
                    projectId={projectId}
                    roomId={roomId}
                    phaseId={currentPhase.id}
                    phaseLabel={currentPhase.label}
                    canComplete={currentPhase.status === "in_progress"}
                  />
                ) : null}
              </div>
            </div>
          </SurfaceCard>
        </header>

        <SurfaceCard className="flex flex-col gap-8 rounded-2xl shadow-sm">
          <div className="flex flex-col gap-2">
            <h2 className="text-title">{bg.room.pipelineTitle}</h2>
            <p className="text-body">{bg.room.pipelineSubtitle}</p>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-max gap-4">
              {room.phases.map((phase, index) => {
                const activeSession = getActivePhaseSession(
                  phaseSessionGroups[index] ?? []
                );

                return (
                <PhaseFocusTarget
                  key={phase.id}
                  phaseId={phase.id}
                  focusPhaseId={focusPhaseId}
                >
                <InsetPanel
                  className={cn(
                    "flex w-56 shrink-0 flex-col gap-4 rounded-2xl p-5 shadow-sm transition-colors",
                    phase.is_current
                      ? "bg-accent ring-1 ring-primary/15"
                      : "hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {bg.room.phaseStep(index + 1, room.phases.length)}
                      </span>
                      <p className="text-section-title leading-snug">{phase.label}</p>
                    </div>
                    {phase.is_current ? (
                      <Badge variant="default">{bg.room.current}</Badge>
                    ) : null}
                  </div>

                  <div className="mt-auto grid gap-2 text-sm">
                    <Badge variant={phaseVariant(phase.status)} className="w-fit">
                      {phaseStatusLabel(phase.status)}
                    </Badge>
                    <span className="text-muted-foreground">
                      {phase.status === "completed"
                        ? bg.room.logged
                        : bg.room.estimated}{" "}
                      {phase.estimated_hours}
                      {bg.common.hoursShort}
                    </span>
                  </div>

                  <PhaseWorkSessionControls
                    projectId={projectId}
                    roomId={roomId}
                    phaseId={phase.id}
                    activeSession={activeSession}
                    runningSession={runningSession}
                  />

                  {phase.blocker_reason ? (
                    <p className="text-sm text-muted-foreground">{phase.blocker_reason}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">{bg.room.phaseDetailHint}</p>
                  )}

                  <PhaseWorkSessionHistory
                    entries={phaseHistoryGroups[index] ?? []}
                  />
                </InsetPanel>
                </PhaseFocusTarget>
              );
              })}
            </div>
          </div>
        </SurfaceCard>
      </PageShell>
    </main>
  );
}
