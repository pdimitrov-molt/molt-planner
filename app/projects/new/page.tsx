import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { getClientService } from "@/features/clients/service/get-client-service";
import { ProjectCreationWizard } from "@/features/projects/components/project-creation-wizard";
import { bg } from "@/src/i18n/bg";

export default async function NewProjectPage() {
  const clientService = await getClientService();
  const clients = await clientService.listClients();

  return (
    <main className="min-h-screen">
      <PageShell width="md">
        <PageHeader
          title={bg.projects.newTitle}
          description={bg.projects.newSubtitle}
        />
        <ProjectCreationWizard clients={clients} />
      </PageShell>
    </main>
  );
}
