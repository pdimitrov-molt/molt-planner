import { PageHeader, PageShell, SurfaceCard } from "@/components/layout/page-shell";
import { bg } from "@/src/i18n/bg";

export default function SettingsPage() {
  return (
    <main className="min-h-screen">
      <PageShell width="md">
        <PageHeader
          title={bg.settings.title}
          description={bg.settings.subtitle}
        />
        <SurfaceCard>
          <p className="text-base leading-relaxed text-muted-foreground">
            {bg.settings.placeholder}
          </p>
        </SurfaceCard>
      </PageShell>
    </main>
  );
}
