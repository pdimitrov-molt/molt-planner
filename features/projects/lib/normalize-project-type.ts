import {
  PROJECT_TYPES,
  type ProjectType,
} from "@/features/projects/types/project";

/**
 * Maps canonical English enum values and legacy localized DB values to ProjectType.
 * Read-path only — writes must use PROJECT_TYPES via validation.
 */
const PROJECT_TYPE_ALIASES: Record<string, ProjectType> = {
  residential: "residential",
  commercial: "commercial",
  hospitality: "hospitality",
  renovation: "renovation",
  staging: "staging",
  // Legacy Bulgarian values that may exist in older rows
  жилище: "residential",
  жилищен: "residential",
  "търговски": "commercial",
  хотел: "hospitality",
  хотелиерски: "hospitality",
  реновация: "renovation",
  ремонт: "renovation",
  "хоум стейджинг": "staging",
  "home staging": "staging",
  сценичен: "staging",
};

export function normalizeProjectType(value: string): ProjectType | null {
  const normalizedKey = value.trim().toLowerCase();
  const projectType = PROJECT_TYPE_ALIASES[normalizedKey];

  if (!projectType) {
    return null;
  }

  return projectType;
}

export function assertProjectType(value: string): ProjectType {
  const projectType = normalizeProjectType(value);

  if (!projectType) {
    throw new Error(`Invalid project type: ${value}`);
  }

  return projectType;
}

export function isCanonicalProjectType(value: string): value is ProjectType {
  return PROJECT_TYPES.includes(value as ProjectType);
}
