import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import type { StudioWorkflowGroupRow } from "@/features/studio-dashboard/types/studio-dashboard-view";
import { bg } from "@/src/i18n/bg";

interface StudioWorkflowGroupsTableProps {
  groups: StudioWorkflowGroupRow[];
}

export function StudioWorkflowGroupsTable({ groups }: StudioWorkflowGroupsTableProps) {
  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02]">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4 text-xs text-muted-foreground">
              {bg.studioDashboard.projects.workflowGroups}
            </TableHead>
            <TableHead className="text-xs text-muted-foreground">
              {bg.workflowEngine.currentContext}
            </TableHead>
            <TableHead className="pr-4 text-xs text-muted-foreground">
              {bg.studioDashboard.roomTable.progress}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <TableRow key={group.id} className="hover:bg-emerald-500/[0.03]">
              <TableCell className="pl-4 font-medium">{group.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {group.current_stage_label ?? "—"}
              </TableCell>
              <TableCell className="pr-4">
                <div className="flex min-w-24 items-center gap-2">
                  <Progress value={group.progress_percent} className="h-1.5 flex-1" />
                  <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
                    {group.progress_percent}%
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
