const STORAGE_PREFIX = "molt-workflow-expanded-group";

export function getExpandedWorkflowGroupStorageKey(projectId: string): string {
  return `${STORAGE_PREFIX}:${projectId}`;
}

export function readExpandedWorkflowGroupId(projectId: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(getExpandedWorkflowGroupStorageKey(projectId));
}

export function writeExpandedWorkflowGroupId(
  projectId: string,
  groupId: string | null
): void {
  if (typeof window === "undefined") {
    return;
  }

  const key = getExpandedWorkflowGroupStorageKey(projectId);

  if (!groupId) {
    localStorage.removeItem(key);
    return;
  }

  localStorage.setItem(key, groupId);
}

const STAGE_STORAGE_PREFIX = "molt-workflow-expanded-stage";

export function getExpandedWorkflowStageStorageKey(projectId: string): string {
  return `${STAGE_STORAGE_PREFIX}:${projectId}`;
}

export function readExpandedWorkflowStageId(projectId: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(getExpandedWorkflowStageStorageKey(projectId));
}

export function writeExpandedWorkflowStageId(
  projectId: string,
  stageId: string | null
): void {
  if (typeof window === "undefined") {
    return;
  }

  const key = getExpandedWorkflowStageStorageKey(projectId);

  if (!stageId) {
    localStorage.removeItem(key);
    return;
  }

  localStorage.setItem(key, stageId);
}
