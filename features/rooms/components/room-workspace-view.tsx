import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2Icon } from "lucide-react";

import { PageShell, SurfaceCard } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CompletePhaseButton } from "@/features/phases/components/complete-phase-button";
import { RoomPhasePipeline } from "@/features/rooms/components/room-phase-pipeline";
import { getRoomWorkspaceService } from "@/features/rooms/service/room-workspace.service";
import { getActivePhaseSession } from "@/features/work-sessions/lib/get-active-phase-session";
import {
  findWorkSessionsByPhaseId,
  getPhaseWorkSessionHistory,
  getPhaseWorkStatsByPhaseId,
} from "@/features/work-sessions/service/cached-work-session-queries";
import { getWorkSessionService } from "@/features/work-sessions/service/get-work-session-service";
import { bg } from "@/src/i18n/bg";

interface RoomWorkspaceViewProps {
  projectId: string;
  roomId: string;
  focusPhaseId?: string;
}

export async function RoomWorkspaceView({
  projectId,
  roomId,
  focusPhaseId,
}: RoomWorkspaceViewProps) {
  const [service, workSessionService] = await Promise.all([
    getRoomWorkspaceService(),
    getWorkSessionService(),
  ]);

  const room = await service.getRoomWorkspace(projectId, roomId);

  if (!room) {
    notFound();
  }

  const phaseIds = room.phases.map((phase) => phase.id);

  const [runningSession, phaseSessionGroups, phaseHistoryGroups, phaseStatsGroups] =
    await Promise.all([
      workSessionService.findRunningSession(),
      Promise.all(phaseIds.map((phaseId) => findWorkSessionsByPhaseId(phaseId))),
      Promise.all(phaseIds.map((phaseId) => getPhaseWorkSessionHistory(phaseId))),
      Promise.all(
        room.phases.map((phase) =>
          getPhaseWorkStatsByPhaseId(phase.id, phase.estimated_hours)
        )
      ),
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

        <SurfaceCard className="flex flex-col gap-6 rounded-2xl shadow-sm">
          <div className="flex flex-col gap-2">
            <h2 className="text-title">{bg.room.pipelineTitle}</h2>
            <p className="text-body">{bg.room.pipelineSubtitle}</p>
          </div>

          <RoomPhasePipeline
            projectId={projectId}
            roomId={roomId}
            phases={room.phases}
            focusPhaseId={focusPhaseId}
            runningSession={runningSession}
            phaseSessions={phaseSessionGroups}
            phaseHistory={phaseHistoryGroups}
            phaseStats={phaseStatsGroups}
          />
        </SurfaceCard>
      </PageShell>
    </main>
  );
}
