"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LiveWorkSessionTimer } from "@/features/work-sessions/components/live-work-session-timer";
import type { StudioContinueWorkingView } from "@/features/studio-dashboard/types/studio-dashboard-view";
import { bg } from "@/src/i18n/bg";

interface StudioContinueWorkingSectionProps {
  context: StudioContinueWorkingView;
}

export function StudioContinueWorkingSection({
  context,
}: StudioContinueWorkingSectionProps) {
  return (
    <section className="rounded-[1.125rem] border border-[#35D07F]/25 bg-[#35D07F]/[0.06] p-5 shadow-[var(--card-shadow)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid gap-3">
          <h2 className="text-section-title">{bg.studioDashboard.continueWorking.title}</h2>
          <div className="grid gap-1 text-sm">
            <p>
              <span className="text-muted-foreground">
                {bg.studioDashboard.continueWorking.project}:
              </span>{" "}
              {context.project_name}
            </p>
            <p>
              <span className="text-muted-foreground">
                {bg.studioDashboard.continueWorking.group}:
              </span>{" "}
              {context.group_name}
            </p>
            <p>
              <span className="text-muted-foreground">
                {bg.studioDashboard.continueWorking.stage}:
              </span>{" "}
              {context.stage_name}
            </p>
            <p>
              <span className="text-muted-foreground">
                {bg.studioDashboard.continueWorking.room}:
              </span>{" "}
              {context.room_name ?? bg.studioDashboard.continueWorking.projectLevel}
            </p>
          </div>
          <LiveWorkSessionTimer
            startedAt={context.started_at}
            className="text-3xl text-[#35D07F]"
          />
        </div>

        <Button asChild>
          <Link href={context.href}>{bg.continueWorking.continue}</Link>
        </Button>
      </div>
    </section>
  );
}
