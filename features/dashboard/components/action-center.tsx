import { ActionCenterContinueSection } from "@/features/dashboard/components/action-center-continue-section";
import { ActionCenterDeadlinesSection } from "@/features/dashboard/components/action-center-deadlines-section";
import { ActionCenterNextActions } from "@/features/dashboard/components/action-center-next-actions";
import { ActionCenterWaitingSection } from "@/features/dashboard/components/action-center-waiting-section";
import type { ActionCenterView } from "@/features/dashboard/lib/build-action-center";

interface ActionCenterProps {
  view: ActionCenterView;
}

export function ActionCenter({ view }: ActionCenterProps) {
  return (
    <div className="grid gap-6">
      {view.continueWorking.kind === "running" ? (
        <ActionCenterContinueSection
          session={view.continueWorking.session}
          display={view.continueWorkingDisplay}
        />
      ) : null}

      <ActionCenterNextActions actions={view.nextActions} />

      <div className="grid gap-6 xl:grid-cols-2">
        <ActionCenterWaitingSection items={view.waitingItems} />
        <ActionCenterDeadlinesSection deadlines={view.deadlines} />
      </div>
    </div>
  );
}
