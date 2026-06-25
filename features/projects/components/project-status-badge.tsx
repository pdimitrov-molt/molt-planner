import {
  ENGAGEMENT_STATUS_LABELS,
  type EngagementStatus,
} from "@/features/projects/types/project";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANTS: Record<
  EngagementStatus,
  "default" | "secondary" | "outline" | "destructive" | "ghost"
> = {
  inquiry: "outline",
  active: "default",
  paused: "secondary",
  completed: "ghost",
  archived: "destructive",
};

interface ProjectStatusBadgeProps {
  status: EngagementStatus;
}

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANTS[status]}>
      {ENGAGEMENT_STATUS_LABELS[status]}
    </Badge>
  );
}
