import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StudioRoomRow } from "@/features/studio-dashboard/types/studio-dashboard-view";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

interface StudioRoomTableProps {
  rooms: StudioRoomRow[];
}

const STATUS_BADGE_VARIANT: Record<
  StudioRoomRow["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  completed: "outline",
  in_progress: "default",
  blocked: "destructive",
  not_started: "secondary",
};

export function StudioRoomTable({ rooms }: StudioRoomTableProps) {
  if (rooms.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-blue-500/10 bg-blue-500/[0.02]">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4 text-xs text-muted-foreground">
              {bg.studioDashboard.roomTable.room}
            </TableHead>
            <TableHead className="text-xs text-muted-foreground">
              {bg.studioDashboard.roomTable.currentPhase}
            </TableHead>
            <TableHead className="text-xs text-muted-foreground">
              {bg.studioDashboard.roomTable.currentTask}
            </TableHead>
            <TableHead className="text-xs text-muted-foreground">
              {bg.studioDashboard.roomTable.status}
            </TableHead>
            <TableHead className="text-xs text-muted-foreground">
              {bg.studioDashboard.roomTable.remaining}
            </TableHead>
            <TableHead className="pr-4 text-xs text-muted-foreground">
              {bg.studioDashboard.roomTable.progress}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((room) => (
            <TableRow key={room.id} className="hover:bg-blue-500/[0.03]">
              <TableCell className="pl-4 font-medium">
                <Link href={room.href} className="hover:underline">
                  {room.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {room.current_phase_label}
              </TableCell>
              <TableCell className="max-w-40 truncate text-muted-foreground">
                {room.current_task_label}
              </TableCell>
              <TableCell>
                <Badge
                  variant={STATUS_BADGE_VARIANT[room.status]}
                  className={cn(
                    "font-normal",
                    room.status === "in_progress" &&
                      "border-blue-500/20 bg-blue-500/10 text-blue-800 dark:text-blue-200",
                    room.status === "blocked" &&
                      "border-amber-500/20 bg-amber-500/10 text-amber-900 dark:text-amber-200",
                    room.status === "completed" &&
                      "border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                  )}
                >
                  {room.status_label}
                </Badge>
              </TableCell>
              <TableCell className="tabular-nums text-muted-foreground">
                {room.remaining_hours_label}
              </TableCell>
              <TableCell className="pr-4">
                <div className="flex min-w-24 items-center gap-2">
                  <Progress value={room.progress_percent} className="h-1.5 flex-1" />
                  <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
                    {room.progress_percent}%
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
