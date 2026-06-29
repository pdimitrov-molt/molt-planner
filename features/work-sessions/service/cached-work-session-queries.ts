import "server-only";

import { cache } from "react";

import { getWorkSessionService } from "@/features/work-sessions/service/get-work-session-service";

export const findWorkSessionsByPhaseId = cache(async (phaseId: string) => {
  const service = await getWorkSessionService();
  return service.findByPhase({ phase_id: phaseId });
});

export const getPhaseWorkSessionHistory = cache(async (phaseId: string) => {
  const service = await getWorkSessionService();
  return service.getPhaseHistory(phaseId);
});

export const getPhaseWorkStatsByPhaseId = cache(
  async (phaseId: string, estimatedHours: number) => {
    const service = await getWorkSessionService();
    return service.getPhaseWorkStats({
      phase_id: phaseId,
      estimated_hours: estimatedHours,
    });
  }
);
