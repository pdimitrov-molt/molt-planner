import { PageContainer } from "@/components/layout/page-shell";
import { CapacityBar } from "@/features/today/components/capacity-bar";
import { NextTaskCard } from "@/features/today/components/next-task-card";
import { TodayHeader } from "@/features/today/components/today-header";
import { WaitingCard } from "@/features/today/components/waiting-card";
import { getTodayService } from "@/features/today/service/today.service";

export async function TodayPage() {
  const service = await getTodayService();
  const view = await service.getTodayView();

  return (
    <main className="min-h-screen">
      <PageContainer>
        <TodayHeader view={view} />

        <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
          <div className="grid gap-8">
            <NextTaskCard task={view.next_task} />
            <WaitingCard items={view.waiting_items} />
          </div>

          <CapacityBar capacity={view.capacity} />
        </div>
      </PageContainer>
    </main>
  );
}
