import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { IntakePlanner } from "@/features/intake/components/intake-planner";
import { getIntakeService } from "@/features/intake/service/intake.service";
import { bg } from "@/src/i18n/bg";

export default async function IntakePage() {
  const intakeService = await getIntakeService();
  const studio = await intakeService.getStudioContext();

  return (
    <main className="min-h-screen">
      <PageShell width="md">
        <PageHeader
          title={bg.intake.title}
          description={bg.intake.subtitle}
        />
        <IntakePlanner studio={studio} />
      </PageShell>
    </main>
  );
}
