import "server-only";

/** Shared TTL for studio dashboard cache buckets (15–30s target). */
export const STUDIO_CACHE_REVALIDATE_SECONDS = 20;

export const STUDIO_CACHE_TAGS = {
  projects: "studio-projects",
  waiting: "studio-waiting",
  capacity: "studio-capacity",
  health: "studio-health",
} as const;
