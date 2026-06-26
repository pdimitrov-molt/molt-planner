"use client";

import { useEffect, useState } from "react";

import type { WorkspaceRoomSummary } from "@/features/projects/types/project-workspace";
import { RoomCompactRow } from "@/features/projects/components/workspace/room-compact-row";
import { RoomSummaryCard } from "@/features/projects/components/workspace/room-summary-card";
import {
  readExpandedRoomId,
  writeExpandedRoomId,
} from "@/features/projects/lib/workspace-room-storage";
import type { WorkSession } from "@/features/work-sessions/types/work-session";

interface WorkspaceRoomAccordionProps {
  projectId: string;
  rooms: WorkspaceRoomSummary[];
  runningSession: WorkSession | null;
  roomCurrentPhaseSessions: Record<string, WorkSession | null>;
}

function resolveDefaultExpandedRoomId(rooms: WorkspaceRoomSummary[]): string | null {
  return rooms.find((room) => room.is_focus)?.id ?? rooms[0]?.id ?? null;
}

export function WorkspaceRoomAccordion({
  projectId,
  rooms,
  runningSession,
  roomCurrentPhaseSessions,
}: WorkspaceRoomAccordionProps) {
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(() =>
    resolveDefaultExpandedRoomId(rooms)
  );

  useEffect(() => {
    const savedRoomId = readExpandedRoomId(projectId);

    if (savedRoomId && rooms.some((room) => room.id === savedRoomId)) {
      setExpandedRoomId(savedRoomId);
      return;
    }

    setExpandedRoomId(resolveDefaultExpandedRoomId(rooms));
  }, [projectId, rooms]);

  useEffect(() => {
    if (!expandedRoomId) {
      return;
    }

    writeExpandedRoomId(projectId, expandedRoomId);
  }, [projectId, expandedRoomId]);

  function handleExpand(roomId: string) {
    setExpandedRoomId((currentRoomId) =>
      currentRoomId === roomId ? currentRoomId : roomId
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {rooms.map((room) => {
        const isExpanded = expandedRoomId === room.id;

        if (isExpanded) {
          return (
            <RoomSummaryCard
              key={room.id}
              projectId={projectId}
              room={room}
              runningSession={runningSession}
              currentPhaseActiveSession={roomCurrentPhaseSessions[room.id] ?? null}
            />
          );
        }

        return (
          <RoomCompactRow
            key={room.id}
            room={room}
            onExpand={() => handleExpand(room.id)}
          />
        );
      })}
    </div>
  );
}
