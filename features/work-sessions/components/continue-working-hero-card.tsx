"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { SurfaceCard } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { CompleteWorkSessionDialog } from "@/features/work-sessions/components/complete-work-session-dialog";
import { LiveWorkSessionTimer } from "@/features/work-sessions/components/live-work-session-timer";
import type { ContinueWorkingResult } from "@/features/work-sessions/types/continue-working";
import { bg } from "@/src/i18n/bg";

interface ContinueWorkingHeroCardProps {
  continueWorking: ContinueWorkingResult;
}

export function ContinueWorkingHeroCard({
  continueWorking,
}: ContinueWorkingHeroCardProps) {
  if (continueWorking.kind === "empty") {
    return (
      <SurfaceCard className="rounded-3xl bg-muted/30 p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid max-w-2xl gap-3">
            <h2 className="text-display">{bg.continueWorking.title}</h2>
            <p className="text-body">{bg.continueWorking.emptyMessage}</p>
          </div>
          <Button asChild size="lg" className="h-14 rounded-2xl px-8 text-base">
            <Link href="/projects/new">{bg.continueWorking.newProject}</Link>
          </Button>
        </div>
      </SurfaceCard>
    );
  }

  if (continueWorking.kind === "running") {
    return (
      <RunningContinueWorkingHero session={continueWorking.session} />
    );
  }

  return <CompletedContinueWorkingHero session={continueWorking.session} />;
}

function RunningContinueWorkingHero({
  session,
}: {
  session: Extract<ContinueWorkingResult, { kind: "running" }>["session"];
}) {
  const router = useRouter();
  const [completeOpen, setCompleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleContinue() {
    startTransition(() => {
      router.push(`/projects/${session.project_id}`);
    });
  }

  return (
    <>
      <SurfaceCard className="rounded-3xl bg-emerald-500/10 p-8 shadow-sm">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid max-w-2xl gap-5">
            <div className="grid gap-2">
              <h2 className="text-display">{bg.continueWorking.title}</h2>
              <p className="text-section-title text-emerald-800 dark:text-emerald-200">
                {bg.continueWorking.runningLabel}
              </p>
            </div>

            <SessionDetails session={session} />

            <LiveWorkSessionTimer
              startedAt={session.started_at}
              className="text-5xl text-emerald-800 dark:text-emerald-200"
            />
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-56">
            <Button
              type="button"
              size="lg"
              className="h-14 rounded-2xl px-8 text-base"
              onClick={handleContinue}
              disabled={isPending}
            >
              {bg.continueWorking.continue}
            </Button>
            <Button
              type="button"
              size="lg"
              variant="secondary"
              className="h-14 rounded-2xl px-8 text-base"
              onClick={() => setCompleteOpen(true)}
              disabled={isPending}
            >
              {bg.continueWorking.finish}
            </Button>
          </div>
        </div>
      </SurfaceCard>

      <CompleteWorkSessionDialog
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        sessionId={session.session_id}
        onCompleted={() => router.refresh()}
      />
    </>
  );
}

function CompletedContinueWorkingHero({
  session,
}: {
  session: Extract<ContinueWorkingResult, { kind: "completed" }>["session"];
}) {
  const continueHref = `/projects/${session.project_id}/rooms/${session.room_id}?focusPhase=${session.phase_id}`;

  return (
    <SurfaceCard className="rounded-3xl bg-emerald-500/10 p-8 shadow-sm">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid max-w-2xl gap-5">
          <div className="grid gap-2">
            <h2 className="text-display">{bg.continueWorking.title}</h2>
            <p className="text-section-title">{bg.continueWorking.lastWorkedLabel}</p>
          </div>

          <SessionDetails session={session} />

          {session.note ? (
            <DetailBlock
              label={bg.continueWorking.lastNote}
              value={session.note}
            />
          ) : null}

          {session.next_step ? (
            <DetailBlock
              label={bg.continueWorking.lastNextStep}
              value={session.next_step}
            />
          ) : null}

          <p className="text-sm text-muted-foreground">
            {bg.continueWorking.timeWorked}:{" "}
            <span className="font-medium text-foreground tabular-nums">
              {session.duration_label}
            </span>
          </p>
        </div>

        <Button asChild size="lg" className="h-14 rounded-2xl px-8 text-base">
          <Link href={continueHref}>{bg.continueWorking.startWork}</Link>
        </Button>
      </div>
    </SurfaceCard>
  );
}

function SessionDetails({
  session,
}: {
  session: Extract<ContinueWorkingResult, { kind: "running" | "completed" }>["session"];
}) {
  return (
    <div className="grid gap-2 text-sm">
      <p>
        <span className="text-muted-foreground">
          {bg.workSession.dashboardProject}:
        </span>{" "}
        <span className="font-medium">{session.project_name}</span>
      </p>
      <p>
        <span className="text-muted-foreground">
          {bg.workSession.dashboardRoom}:
        </span>{" "}
        <span className="font-medium">{session.room_name}</span>
      </p>
      <p>
        <span className="text-muted-foreground">
          {bg.workSession.dashboardPhase}:
        </span>{" "}
        <span className="font-medium">{session.phase_label}</span>
      </p>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-body whitespace-pre-wrap">{value}</p>
    </div>
  );
}
