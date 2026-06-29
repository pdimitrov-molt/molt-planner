import { PageShell } from "@/components/layout/page-shell";
import { PersonalItemsDashboard } from "@/features/personal-items/components/personal-items-dashboard";
import { listPersonalItems } from "@/features/personal-items/service/get-personal-item-service";

export default async function PersonalPage() {
  const items = await listPersonalItems();

  return (
    <main className="min-h-screen">
      <PageShell width="lg">
        <PersonalItemsDashboard items={items} />
      </PageShell>
    </main>
  );
}
