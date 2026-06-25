import Link from "next/link";
import { notFound } from "next/navigation";

import { InsetPanel, PageShell, SurfaceCard } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CompletePhaseButton } from "@/features/phases/components/complete-phase-button";
import type { PhaseStatus } from "@/features/phases/types/phase";
import { getRoomWorkspaceService } from "@/features/rooms/service/room-workspace.service";
import { bg } from "@/src/i18n/bg";

interface RoomWorkspaceViewProps {
  projectId: string;
  roomId: string;
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
}: RoomWorkspaceViewProps) {
  const service = await getRoomWorkspaceService();
  const room = await service.getRoomWorkspace(projectId, roomId);

  if (!room) {
    notFound();
  }

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

          <SurfaceCard>
            <div className="flex flex-col gap-8">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-display">{room.name}</h1>
                <Badge variant="secondary">{room.room_kind_label}</Badge>
              </div>
              {room.scope_summary ? (
                <p className="text-body">{room.scope_summary}</p>
              ) : null}
              <div className="grid gap-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{bg.room.progress}</span>
                  <span className="font-medium">{room.progress_percent}%</span>
                </div>
                <Progress value={room.progress_percent} />
                <p className="text-sm text-muted-foreground">
                  {bg.room.currentPhase}:{" "}
                  <strong>
                    {room.current_phase_label || bg.common.notStarted}
                  </strong>
                </p>
                {currentPhase ? (
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

        <SurfaceCard className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-title">{bg.room.pipelineTitle}</h2>
            <p className="text-body">{bg.room.pipelineSubtitle}</p>
          </div>

          <div className="grid gap-4">
            {room.phases.map((phase) => (
              <InsetPanel
                key={phase.id}
                className={
                  phase.is_current
                    ? "bg-accent ring-1 ring-primary/15"
                    : undefined
                }
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <p className="text-section-title">{phase.label}</p>
                    {phase.is_current ? (
                      <Badge variant="default">{bg.room.current}</Badge>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {phase.status === "completed"
                        ? bg.room.logged
                        : bg.room.estimated}{" "}
                      {phase.estimated_hours}
                      {bg.common.hoursShort}
                    </span>
                    <Badge variant={phaseVariant(phase.status)}>
                      {phaseStatusLabel(phase.status)}
                    </Badge>
                  </div>
                </div>
                {phase.blocker_reason ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {phase.blocker_reason}
                  </p>
                ) : null}
              </InsetPanel>
            ))}
          </div>
        </SurfaceCard>
      </PageShell>
    </main>
  );
}
