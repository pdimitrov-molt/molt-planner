import { ChevronDownIcon } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import type { WorkspaceRoomSummary } from "@/features/projects/types/project-workspace";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

interface RoomCompactRowProps {
  room: WorkspaceRoomSummary;
  onExpand: () => void;
}

export function RoomCompactRow({ room, onExpand }: RoomCompactRowProps) {
  return (
    <button
      type="button"
      onClick={onExpand}
      className={cn(
        "flex w-full flex-col gap-4 rounded-2xl bg-card px-5 py-4 text-left shadow-sm transition-colors hover:bg-muted/20",
        room.is_focus && "ring-1 ring-emerald-500/20"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="grid min-w-0 flex-1 gap-1">
          <p className="text-section-title">{room.name}</p>
          <p className="text-sm tabular-nums text-muted-foreground">
            {bg.progress.phaseCount(room.completed_phases, room.total_phases)}
          </p>
        </div>
        <ChevronDownIcon className="size-5 shrink-0 text-muted-foreground" />
      </div>

      <Progress value={room.progress_percent} className="h-2" />

      <p className="text-sm text-muted-foreground">
        {bg.projects.workspace.rooms.nextPhase}:{" "}
        <span className="font-medium text-foreground">
          {room.next_phase_label ?? room.current_phase_label}
        </span>
      </p>
    </button>
  );
}
