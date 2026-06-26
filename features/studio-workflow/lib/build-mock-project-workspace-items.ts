import type { ProjectWithClient } from "@/features/projects/types/project";
import {
  PROJECT_WORK_KIND_LABELS,
  type ProjectWorkKind,
} from "@/features/studio-workflow/types/project-work-kind";
import type { ProjectWorkspaceItem } from "@/features/studio-workflow/types/workspace-item";

interface MockProjectWorkStep {
  kind: ProjectWorkKind;
  status: ProjectWorkspaceItem["status"];
  daysUntilDeadline?: number;
}

const DEFAULT_MOCK_SEQUENCE: MockProjectWorkStep[] = [
  { kind: "inquiry", status: "completed" },
  { kind: "offer", status: "completed" },
  { kind: "contract", status: "completed" },
  { kind: "research", status: "in_progress" },
  { kind: "client_presentation", status: "blocked" },
  { kind: "moodboard", status: "not_started", daysUntilDeadline: 5 },
  { kind: "procurement_coordination", status: "not_started" },
  { kind: "final_handover", status: "not_started" },
];

function addDays(referenceDate: Date, days: number): string {
  const date = new Date(referenceDate);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function buildMockProjectWorkspaceItems(
  projects: ProjectWithClient[],
  referenceDate: Date = new Date()
): ProjectWorkspaceItem[] {
  return projects.flatMap((project) =>
    DEFAULT_MOCK_SEQUENCE.map((step) => ({
      scope: "project" as const,
      id: `mock-${project.id}-${step.kind}`,
      project_id: project.id,
      project_name: project.name,
      kind: step.kind,
      label: PROJECT_WORK_KIND_LABELS[step.kind],
      status: step.status,
      target_end_date:
        step.daysUntilDeadline !== undefined
          ? addDays(referenceDate, step.daysUntilDeadline)
          : null,
    }))
  );
}

export function getActiveMockProjectItems(
  items: ProjectWorkspaceItem[]
): ProjectWorkspaceItem[] {
  return items.filter((item) => item.status !== "completed");
}
