import { SurfaceCard } from "@/components/layout/page-shell";
import { Progress } from "@/components/ui/progress";
import type { ProjectWorkspace } from "@/features/projects/types/project-workspace";
import { bg } from "@/src/i18n/bg";

interface WorkspaceProgressHeroProps {
  workspace: ProjectWorkspace;
}

export function WorkspaceProgressHero({ workspace }: WorkspaceProgressHeroProps) {
  return (
    <SurfaceCard className="rounded-3xl bg-emerald-500/10 p-8 shadow-sm">
      <div className="grid gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="grid gap-2">
            <p className="text-eyebrow">{bg.progress.projectLabel}</p>
            <p className="text-5xl font-semibold tracking-tight tabular-nums">
              {workspace.overall_completion_percent}%
            </p>
          </div>
          <div className="grid gap-1 text-right text-sm">
            <p className="font-medium">
              {bg.progress.phaseCount(
                workspace.completed_phases,
                workspace.total_phases
              )}
            </p>
            <p className="text-muted-foreground">
              {bg.progress.roomCount(
                workspace.completed_rooms,
                workspace.total_rooms
              )}
            </p>
          </div>
        </div>

        <Progress value={workspace.overall_completion_percent} className="h-3" />
      </div>
    </SurfaceCard>
  );
}
