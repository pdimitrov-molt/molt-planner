"use client";

import { createContext, useContext, type ReactNode } from "react";

import {
  getProjectAccentStyles,
  resolveProjectAccentColor,
  type ProjectAccentColor,
  type ProjectAccentStyles,
} from "@/features/studio-dashboard/lib/project-accent-colors";

interface ProjectColorContextValue {
  projectId: string;
  accent: ProjectAccentColor;
  styles: ProjectAccentStyles;
}

const ProjectColorContext = createContext<ProjectColorContextValue | null>(null);

interface ProjectColorProviderProps {
  projectId: string;
  children: ReactNode;
}

export function ProjectColorProvider({ projectId, children }: ProjectColorProviderProps) {
  const accent = resolveProjectAccentColor(projectId);
  const styles = getProjectAccentStyles(projectId);

  return (
    <ProjectColorContext.Provider value={{ projectId, accent, styles }}>
      {children}
    </ProjectColorContext.Provider>
  );
}

export function useProjectColor(): ProjectColorContextValue {
  const context = useContext(ProjectColorContext);

  if (!context) {
    throw new Error("useProjectColor must be used within ProjectColorProvider.");
  }

  return context;
}

export function useProjectColorOptional(projectId: string): ProjectColorContextValue {
  const context = useContext(ProjectColorContext);

  if (context && context.projectId === projectId) {
    return context;
  }

  return {
    projectId,
    accent: resolveProjectAccentColor(projectId),
    styles: getProjectAccentStyles(projectId),
  };
}
