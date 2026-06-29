import type { PhaseKind } from "@/features/phases/types/phase";

export interface ProjectWorkflowStage {
  id: string;
  key: string;
  label: string;
  enabled: boolean;
  estimated_hours: number;
  sort_order: number;
  phase_kind: PhaseKind | null;
}

export interface ProjectWorkflowDefinition {
  stages: ProjectWorkflowStage[];
}
