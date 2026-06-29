import {
  CommandCenterHealthSection,
  CommandCenterSidebarSection,
} from "@/features/studio-dashboard/components/command-center-dashboard";
import { getCommandCenterBackground } from "@/features/studio-dashboard/lib/load-command-center";
import type { CommandCenterCriticalView } from "@/features/studio-dashboard/types/command-center-view";

interface CommandCenterHealthProps {
  critical: CommandCenterCriticalView;
}

export async function CommandCenterHealth({ critical }: CommandCenterHealthProps) {
  const { background } = await getCommandCenterBackground();

  return (
    <CommandCenterHealthSection
      critical={critical}
      activeProjectCount={background.active_projects.length}
      capacity={background.capacity}
    />
  );
}

export async function CommandCenterSidebar() {
  const { background, studioTimeline } = await getCommandCenterBackground();

  return (
    <CommandCenterSidebarSection
      capacity={background.capacity}
      studioTimeline={studioTimeline}
    />
  );
}
