const STORAGE_KEY = "molt-studio-dashboard-expanded-project";

export function readExpandedProjectId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(STORAGE_KEY);
}

export function writeExpandedProjectId(projectId: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!projectId) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(STORAGE_KEY, projectId);
}
