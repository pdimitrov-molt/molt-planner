import type { ProjectWorkspace } from "@/features/projects/types/project-workspace";
import { WorkspaceToday } from "@/features/projects/components/workspace/workspace-today";
import { WorkspaceWaiting } from "@/features/projects/components/workspace/workspace-waiting";
import { bg } from "@/src/i18n/bg";

interface WorkspaceContextProps {
  workspace: ProjectWorkspace;
}

export function WorkspaceContext({ workspace }: WorkspaceContextProps) {
  const hasToday = workspace.today_tasks.length > 0;
  const hasWaiting = workspace.waiting_items.length > 0;

  if (!hasToday && !hasWaiting) {
    return null;
  }

  return (
    <section className="flex flex-col gap-6 border-t border-border/60 pt-12">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-section-title">{bg.projects.workspace.context.title}</h2>
        {hasToday ? (
          <span className="text-caption">
            {bg.projects.workspace.context.todayCount(workspace.today_tasks.length)}
          </span>
        ) : null}
        {hasWaiting ? (
          <span className="text-caption">
            {bg.projects.workspace.context.waitingCount(workspace.waiting_items.length)}
          </span>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {hasToday ? <WorkspaceToday workspace={workspace} /> : null}
        {hasWaiting ? <WorkspaceWaiting workspace={workspace} /> : null}
      </div>
    </section>
  );
}
