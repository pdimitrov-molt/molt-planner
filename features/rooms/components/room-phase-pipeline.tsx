"use client";

import { useEffect, useState } from "react";

import { StageWorkPanel } from "@/features/work-sessions/components/stage-work-panel";
import {
  StageAccordionList,
  phaseProgressPercent,
  type StageAccordionItem,
} from "@/features/work-sessions/components/stage-accordion";
import { PhaseFocusTarget } from "@/features/work-sessions/components/phase-focus-target";
import { getActivePhaseSession } from "@/features/work-sessions/lib/get-active-phase-session";
import type { PhaseWorkStats } from "@/features/work-sessions/lib/calculate-phase-work-stats";
import type { PhaseWorkSessionHistoryEntry } from "@/features/work-sessions/types/work-session-log";
import type { WorkSession } from "@/features/work-sessions/types/work-session";
import type { PhaseStatus } from "@/features/phases/types/phase";

interface RoomPhasePipelineItem {
  id: string;
  label: string;
  status: PhaseStatus;
  is_current: boolean;
  blocker_reason: string | null;
  estimated_hours: number;
}

interface RoomPhasePipelineProps {
  projectId: string;
  roomId: string;
  phases: RoomPhasePipelineItem[];
  focusPhaseId?: string;
  runningSession: WorkSession | null;
  phaseSessions: WorkSession[][];
  phaseHistory: PhaseWorkSessionHistoryEntry[][];
  phaseStats: PhaseWorkStats[];
}

export function RoomPhasePipeline({
  projectId,
  roomId,
  phases,
  focusPhaseId,
  runningSession,
  phaseSessions,
  phaseHistory,
  phaseStats,
}: RoomPhasePipelineProps) {
  const currentPhaseId = phases.find((phase) => phase.is_current)?.id ?? null;
  const [expandedStageId, setExpandedStageId] = useState<string | null>(
    focusPhaseId ?? currentPhaseId
  );

  useEffect(() => {
    if (focusPhaseId) {
      setExpandedStageId(focusPhaseId);
      return;
    }

    if (currentPhaseId) {
      setExpandedStageId(currentPhaseId);
    }
  }, [focusPhaseId, currentPhaseId]);

  function handleToggleStage(stageId: string) {
    setExpandedStageId((current) => (current === stageId ? null : stageId));
  }

  const accordionItems: StageAccordionItem[] = phases.map((phase, index) => ({
    id: phase.id,
    title: phase.label,
    status: phase.status,
    progress_percent: phaseProgressPercent({
      status: phase.status,
      worked_hours: phaseStats[index]?.worked_hours,
      estimated_hours: phase.estimated_hours,
    }),
    is_current: phase.is_current,
  }));

  return (
    <StageAccordionList
      items={accordionItems}
      expandedStageId={expandedStageId}
      onToggleStage={handleToggleStage}
      renderExpandedContent={(item) => {
        const index = phases.findIndex((phase) => phase.id === item.id);
        const phase = phases[index];

        if (!phase || index < 0) {
          return null;
        }

        const sessions = phaseSessions[index] ?? [];
        const activeSession = getActivePhaseSession(sessions);

        return (
          <PhaseFocusTarget phaseId={phase.id} focusPhaseId={focusPhaseId}>
            <div className="grid gap-3">
              <StageWorkPanel
                projectId={projectId}
                roomId={roomId}
                phaseId={phase.id}
                stageName={phase.label}
                progressPercent={item.progress_percent}
                stats={phaseStats[index]!}
                history={phaseHistory[index] ?? []}
                activeSession={activeSession}
                runningSession={runningSession}
                canCompleteStage={phase.status === "in_progress"}
                layout="accordion"
              />

              {phase.blocker_reason ? (
                <p className="text-sm text-muted-foreground">{phase.blocker_reason}</p>
              ) : null}
            </div>
          </PhaseFocusTarget>
        );
      }}
    />
  );
}
