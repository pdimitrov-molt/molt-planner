export type InboxItemKind = "project" | "personal" | "waiting";

export type InboxFilter = "all" | "project" | "personal" | "waiting";

export interface InboxItem {
  id: string;
  kind: InboxItemKind;
  title: string;
  subtitle: string;
  planner_score: number;
  deadline_iso: string | null;
  deadline_label: string | null;
  priority_weight: number;
  priority_label: string;
  status_label: string | null;
  href: string;
  project_id: string | null;
}

export interface InboxView {
  items: InboxItem[];
  counts: Record<InboxFilter, number>;
  reference_date: string;
}
