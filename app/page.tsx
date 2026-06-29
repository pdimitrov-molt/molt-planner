import { Suspense } from "react";

import { PageHeader, PageShell } from "@/components/layout/page-shell";
import {
  CommandCenterHealth,
  CommandCenterSidebar,
} from "@/features/studio-dashboard/components/command-center-background";
import {
  CommandCenterHealthFallback,
  CommandCenterSidebarFallback,
} from "@/features/studio-dashboard/components/command-center-background-fallback";
import { CommandCenterDashboard } from "@/features/studio-dashboard/components/command-center-dashboard";
import { loadCommandCenterCritical } from "@/features/studio-dashboard/lib/load-command-center";
import { bg } from "@/src/i18n/bg";

export default async function HomePage() {
  const critical = await loadCommandCenterCritical();

  return (
    <main className="min-h-screen">
      <PageShell width="full">
        <PageHeader
          eyebrow="Studio OS"
          title={bg.commandCenter.title}
          description={bg.commandCenter.subtitle}
        />

        <CommandCenterDashboard
          critical={critical}
          health={
            <Suspense fallback={<CommandCenterHealthFallback />}>
              <CommandCenterHealth critical={critical} />
            </Suspense>
          }
          sidebar={
            <Suspense fallback={<CommandCenterSidebarFallback />}>
              <CommandCenterSidebar />
            </Suspense>
          }
        />
      </PageShell>
    </main>
  );
}
