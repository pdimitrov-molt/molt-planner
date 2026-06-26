import type { PhaseStatus } from "@/features/phases/types/phase";
import type {
  PhaseProgressSnapshot,
  ProjectProgress,
  RoomProgress,
} from "@/features/progress/types/progress";

type ProgressPhaseInput = Pick<PhaseProgressSnapshot, "status">;
type ProgressRoomInput = { phases: ProgressPhaseInput[] };

export function calculateRoomProgress(phases: ProgressPhaseInput[]): RoomProgress {
  const totalPhases = phases.length;

  if (totalPhases === 0) {
    return {
      completed_phases: 0,
      total_phases: 0,
      progress_percent: 0,
      is_completed: false,
    };
  }

  const completedPhases = phases.filter(
    (phase) => phase.status === "completed"
  ).length;

  return {
    completed_phases: completedPhases,
    total_phases: totalPhases,
    progress_percent: Math.round((completedPhases / totalPhases) * 100),
    is_completed: completedPhases === totalPhases,
  };
}

export function calculateProjectProgress(rooms: ProgressRoomInput[]): ProjectProgress {
  const roomProgressList = rooms.map((room) => calculateRoomProgress(room.phases));
  const totalRooms = roomProgressList.length;
  const completedRooms = roomProgressList.filter((room) => room.is_completed).length;
  const totalPhases = roomProgressList.reduce(
    (total, room) => total + room.total_phases,
    0
  );
  const completedPhases = roomProgressList.reduce(
    (total, room) => total + room.completed_phases,
    0
  );

  return {
    completed_rooms: completedRooms,
    total_rooms: totalRooms,
    completed_phases: completedPhases,
    total_phases: totalPhases,
    progress_percent:
      totalPhases === 0
        ? 0
        : Math.round((completedPhases / totalPhases) * 100),
    is_completed: totalRooms > 0 && completedRooms === totalRooms,
  };
}

export function isRoomCompletedToday(
  phases: PhaseProgressSnapshot[],
  dayStartIso: string,
  dayEndIso: string
): boolean {
  if (phases.length === 0) {
    return false;
  }

  if (!phases.every((phase) => phase.status === "completed")) {
    return false;
  }

  const latestCompletedAt = phases
    .map((phase) => phase.completed_at)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);

  if (!latestCompletedAt) {
    return false;
  }

  const completedTime = Date.parse(latestCompletedAt);
  const dayStart = Date.parse(dayStartIso);
  const dayEnd = Date.parse(dayEndIso);

  return completedTime >= dayStart && completedTime < dayEnd;
}
