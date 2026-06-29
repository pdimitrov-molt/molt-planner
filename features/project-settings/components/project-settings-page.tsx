import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { ProjectSettingsForm } from "@/features/project-settings/components/project-settings-form";
import { getProjectSettingsService } from "@/features/project-settings/service/get-project-settings-service";
import { getClientService } from "@/features/clients/service/get-client-service";
import { bg } from "@/src/i18n/bg";

interface ProjectSettingsPageProps {
  params: Promise<{ id: string }>;
}

export async function ProjectSettingsPage({ params }: ProjectSettingsPageProps) {
  const { id } = await params;
  const settingsService = await getProjectSettingsService();
  const clientService = await getClientService();

  const [settings, clients] = await Promise.all([
    settingsService.getProjectSettings(id),
    clientService.listClients(),
  ]);

  if (!settings) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <PageShell width="lg">
        <div className="grid gap-6">
          <Link
            href={`/projects/${settings.project.id}`}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {bg.projects.settings.backToProject}
          </Link>

          <PageHeader
            title={bg.projects.settings.title}
            description={bg.projects.settings.subtitle}
          />

          <ProjectSettingsForm initialSettings={settings} clients={clients} />
        </div>
      </PageShell>
    </main>
  );
}
