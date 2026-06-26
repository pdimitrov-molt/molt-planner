import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { ActionCenter } from "@/features/dashboard/components/action-center";
import { getActionCenterService } from "@/features/dashboard/service/action-center.service";
import { bg } from "@/src/i18n/bg";

export async function Dashboard() {
  const actionCenterService = await getActionCenterService();
  const view = await actionCenterService.getActionCenterView();

  return (
    <main className="min-h-screen">
      <PageShell>
        <PageHeader
          title={bg.actionCenter.title}
          description={bg.actionCenter.subtitle}
        />

        <ActionCenter view={view} />
      </PageShell>
    </main>
  );
}
