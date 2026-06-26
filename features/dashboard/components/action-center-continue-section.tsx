"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { CompleteWorkSessionDialog } from "@/features/work-sessions/components/complete-work-session-dialog";
import { LiveWorkSessionTimer } from "@/features/work-sessions/components/live-work-session-timer";
import type { ContinueWorkingSession } from "@/features/work-sessions/types/continue-working";
import type { WorkflowActionDisplay } from "@/features/studio-workflow/types/workspace-item";
import { bg } from "@/src/i18n/bg";

interface ActionCenterContinueSectionProps {
  session: ContinueWorkingSession;
  display?: WorkflowActionDisplay | null;
}

export function ActionCenterContinueSection({
  session,
  display,
}: ActionCenterContinueSectionProps) {
  const router = useRouter();
  const [completeOpen, setCompleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <section className="rounded-2xl bg-emerald-500/10 p-5 ring-1 ring-emerald-500/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid gap-3">
            <div className="grid gap-1">
              <h2 className="text-title">{bg.continueWorking.title}</h2>
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                {bg.workSession.runningLabel}
              </p>
            </div>
            <div className="grid gap-1 text-sm">
              {display ? (
                <>
                  <p className="text-base font-medium">{display.title}</p>
                  <p className="text-muted-foreground">{display.subtitle}</p>
                </>
              ) : (
                <>
                  <p>
                    <span className="text-muted-foreground">
                      {bg.workSession.dashboardProject}:
                    </span>{" "}
                    {session.project_name}
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      {bg.workSession.dashboardRoom}:
                    </span>{" "}
                    {session.room_name} · {session.phase_label}
                  </p>
                </>
              )}
            </div>
            <LiveWorkSessionTimer
              startedAt={session.started_at}
              className="text-4xl text-emerald-800 dark:text-emerald-200"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:min-w-52 lg:flex-col">
            <Button
              type="button"
              className="rounded-xl"
              onClick={() =>
                startTransition(() => {
                  router.push(`/projects/${session.project_id}`);
                })
              }
              disabled={isPending}
            >
              {bg.continueWorking.continue}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="rounded-xl"
              onClick={() => setCompleteOpen(true)}
              disabled={isPending}
            >
              {bg.continueWorking.finish}
            </Button>
            <Button asChild variant="ghost" className="rounded-xl">
              <Link
                href={`/projects/${session.project_id}/rooms/${session.room_id}?focusPhase=${session.phase_id}`}
              >
                {bg.actionCenter.continue.openPhase}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <CompleteWorkSessionDialog
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        sessionId={session.session_id}
        onCompleted={() => router.refresh()}
      />
    </>
  );
}
