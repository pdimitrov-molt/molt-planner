"use client";

import Link from "next/link";

import { SurfaceCard } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { LiveWorkSessionTimer } from "@/features/work-sessions/components/live-work-session-timer";
import { bg } from "@/src/i18n/bg";

interface ActiveWorkSessionDashboardCardProps {
  projectId: string;
  projectName: string;
  roomName: string;
  phaseLabel: string;
  startedAt: string;
}

export function ActiveWorkSessionDashboardCard({
  projectId,
  projectName,
  roomName,
  phaseLabel,
  startedAt,
}: ActiveWorkSessionDashboardCardProps) {
  return (
    <SurfaceCard className="rounded-2xl bg-emerald-500/10 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid gap-4">
          <p className="text-section-title text-emerald-800 dark:text-emerald-200">
            {bg.workSession.dashboardTitle}
          </p>
          <div className="grid gap-1 text-sm">
            <p>
              <span className="text-muted-foreground">
                {bg.workSession.dashboardProject}:
              </span>{" "}
              <span className="font-medium">{projectName}</span>
            </p>
            <p>
              <span className="text-muted-foreground">
                {bg.workSession.dashboardRoom}:
              </span>{" "}
              <span className="font-medium">{roomName}</span>
            </p>
            <p>
              <span className="text-muted-foreground">
                {bg.workSession.dashboardPhase}:
              </span>{" "}
              <span className="font-medium">{phaseLabel}</span>
            </p>
          </div>
          <LiveWorkSessionTimer startedAt={startedAt} className="text-4xl" />
        </div>

        <Button asChild size="lg" className="rounded-xl px-8">
          <Link href={`/projects/${projectId}`}>
            {bg.workSession.goToProject}
          </Link>
        </Button>
      </div>
    </SurfaceCard>
  );
}
