export const PROJECT_ACCENT_PALETTE = [
  "green",
  "blue",
  "orange",
  "violet",
  "teal",
  "indigo",
] as const;

export type ProjectAccentColor = (typeof PROJECT_ACCENT_PALETTE)[number];

export interface ProjectAccentStyles {
  border: string;
  strip: string;
  progress: string;
  badge: string;
  badgeText: string;
  dotCompleted: string;
  dotCurrent: string;
  dotCurrentRing: string;
  lineCompleted: string;
  lineCurrent: string;
  labelCurrent: string;
  labelCompleted: string;
  softSurface: string;
}

export const PROJECT_ACCENT_STYLES: Record<ProjectAccentColor, ProjectAccentStyles> = {
  green: {
    border: "border-l-emerald-500",
    strip: "bg-emerald-500",
    progress: "bg-emerald-500",
    badge: "bg-emerald-500/12 border-emerald-500/25",
    badgeText: "text-emerald-800 dark:text-emerald-200",
    dotCompleted: "bg-emerald-500",
    dotCurrent: "bg-emerald-500",
    dotCurrentRing: "ring-emerald-500/30",
    lineCompleted: "bg-emerald-500/40",
    lineCurrent: "bg-emerald-500/40",
    labelCurrent: "text-emerald-700 dark:text-emerald-300 font-medium",
    labelCompleted: "text-emerald-700 dark:text-emerald-300",
    softSurface: "bg-emerald-500/5",
  },
  blue: {
    border: "border-l-blue-500",
    strip: "bg-blue-500",
    progress: "bg-blue-500",
    badge: "bg-blue-500/12 border-blue-500/25",
    badgeText: "text-blue-800 dark:text-blue-200",
    dotCompleted: "bg-blue-500",
    dotCurrent: "bg-blue-500",
    dotCurrentRing: "ring-blue-500/30",
    lineCompleted: "bg-blue-500/40",
    lineCurrent: "bg-blue-500/40",
    labelCurrent: "text-blue-700 dark:text-blue-300 font-medium",
    labelCompleted: "text-blue-700 dark:text-blue-300",
    softSurface: "bg-blue-500/5",
  },
  orange: {
    border: "border-l-orange-500",
    strip: "bg-orange-500",
    progress: "bg-orange-500",
    badge: "bg-orange-500/12 border-orange-500/25",
    badgeText: "text-orange-800 dark:text-orange-200",
    dotCompleted: "bg-orange-500",
    dotCurrent: "bg-orange-500",
    dotCurrentRing: "ring-orange-500/30",
    lineCompleted: "bg-orange-500/40",
    lineCurrent: "bg-orange-500/40",
    labelCurrent: "text-orange-700 dark:text-orange-300 font-medium",
    labelCompleted: "text-orange-700 dark:text-orange-300",
    softSurface: "bg-orange-500/5",
  },
  violet: {
    border: "border-l-violet-500",
    strip: "bg-violet-500",
    progress: "bg-violet-500",
    badge: "bg-violet-500/12 border-violet-500/25",
    badgeText: "text-violet-800 dark:text-violet-200",
    dotCompleted: "bg-violet-500",
    dotCurrent: "bg-violet-500",
    dotCurrentRing: "ring-violet-500/30",
    lineCompleted: "bg-violet-500/40",
    lineCurrent: "bg-violet-500/40",
    labelCurrent: "text-violet-700 dark:text-violet-300 font-medium",
    labelCompleted: "text-violet-700 dark:text-violet-300",
    softSurface: "bg-violet-500/5",
  },
  teal: {
    border: "border-l-teal-500",
    strip: "bg-teal-500",
    progress: "bg-teal-500",
    badge: "bg-teal-500/12 border-teal-500/25",
    badgeText: "text-teal-800 dark:text-teal-200",
    dotCompleted: "bg-teal-500",
    dotCurrent: "bg-teal-500",
    dotCurrentRing: "ring-teal-500/30",
    lineCompleted: "bg-teal-500/40",
    lineCurrent: "bg-teal-500/40",
    labelCurrent: "text-teal-700 dark:text-teal-300 font-medium",
    labelCompleted: "text-teal-700 dark:text-teal-300",
    softSurface: "bg-teal-500/5",
  },
  indigo: {
    border: "border-l-indigo-500",
    strip: "bg-indigo-500",
    progress: "bg-indigo-500",
    badge: "bg-indigo-500/12 border-indigo-500/25",
    badgeText: "text-indigo-800 dark:text-indigo-200",
    dotCompleted: "bg-indigo-500",
    dotCurrent: "bg-indigo-500",
    dotCurrentRing: "ring-indigo-500/30",
    lineCompleted: "bg-indigo-500/40",
    lineCurrent: "bg-indigo-500/40",
    labelCurrent: "text-indigo-700 dark:text-indigo-300 font-medium",
    labelCompleted: "text-indigo-700 dark:text-indigo-300",
    softSurface: "bg-indigo-500/5",
  },
};

function hashProjectId(projectId: string): number {
  let hash = 0;

  for (let index = 0; index < projectId.length; index += 1) {
    hash = (hash + projectId.charCodeAt(index) * (index + 1)) >>> 0;
  }

  return hash;
}

export function resolveProjectAccentColor(projectId: string): ProjectAccentColor {
  return PROJECT_ACCENT_PALETTE[hashProjectId(projectId) % PROJECT_ACCENT_PALETTE.length];
}

export function getProjectAccentStyles(projectId: string): ProjectAccentStyles {
  return PROJECT_ACCENT_STYLES[resolveProjectAccentColor(projectId)];
}

export type CapacityLoadLevel = "low" | "medium" | "high";

export function resolveCapacityLoadLevel(percent: number): CapacityLoadLevel {
  if (percent > 90) {
    return "high";
  }

  if (percent >= 70) {
    return "medium";
  }

  return "low";
}

export const CAPACITY_LOAD_STYLES: Record<
  CapacityLoadLevel,
  { progress: string; text: string }
> = {
  low: {
    progress: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  medium: {
    progress: "bg-orange-500",
    text: "text-orange-700 dark:text-orange-300",
  },
  high: {
    progress: "bg-red-500",
    text: "text-red-700 dark:text-red-300",
  },
};

export type RiskSeverityLevel = "warning" | "elevated" | "critical";

export function resolveRiskSeverity(input: {
  risk_status: "risk" | "overdue";
  slack_days: number | null;
}): RiskSeverityLevel {
  if (input.risk_status === "overdue") {
    return "critical";
  }

  if (input.slack_days !== null && input.slack_days <= 3) {
    return "elevated";
  }

  return "warning";
}

export const RISK_SEVERITY_STYLES: Record<
  RiskSeverityLevel,
  { border: string; badge: string }
> = {
  warning: {
    border: "border-yellow-500/45",
    badge: "border-yellow-500/30 bg-yellow-500/10 text-yellow-900 dark:text-yellow-100",
  },
  elevated: {
    border: "border-orange-500/45",
    badge: "border-orange-500/30 bg-orange-500/10 text-orange-900 dark:text-orange-100",
  },
  critical: {
    border: "border-red-500/45",
    badge: "border-red-500/30 bg-red-500/10 text-red-900 dark:text-red-100",
  },
};
