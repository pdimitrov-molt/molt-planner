import { formatWorkDurationMinutes } from "@/features/work-sessions/lib/format-work-duration";
import { getDayBounds } from "@/features/work-sessions/lib/get-day-bounds";
import {
  calculateProjectProgress,
  calculateRoomProgress,
  isRoomCompletedToday,
} from "@/features/progress/lib/calculate-progress";
import { ProgressRepository } from "@/features/progress/repository/progress.repository";
import type {
  PhaseProgressSnapshot,
  ProjectProgress,
  ProjectProgressSnapshot,
  RoomProgress,
  StudioProgressSummary,
} from "@/features/progress/types/progress";

export class ProgressService {
  constructor(private readonly repository: ProgressRepository) {}

  calculateRoomProgress(
    phases: Array<{ status: PhaseProgressSnapshot["status"] }>
  ): RoomProgress {
    return calculateRoomProgress(phases);
  }

  calculateProjectProgress(
    rooms: Array<{ phases: Array<{ status: PhaseProgressSnapshot["status"] }> }>
  ): ProjectProgress {
    return calculateProjectProgress(rooms);
  }

  async getStudioProgressSummary(
    hoursWorkedTodayMinutes: number,
    referenceDate: Date = new Date()
  ): Promise<StudioProgressSummary> {
    const projects = await this.repository.findStudioProgressSnapshot();
    const { dayStartIso, dayEndIso } = getDayBounds(referenceDate);

    let completedPhases = 0;
    let totalPhases = 0;
    let projectsInProgress = 0;
    let roomsCompletedToday = 0;

    for (const project of projects) {
      const projectProgress = calculateProjectProgress(project.rooms);

      completedPhases += projectProgress.completed_phases;
      totalPhases += projectProgress.total_phases;

      if (
        project.engagement_status === "active" &&
        !projectProgress.is_completed
      ) {
        projectsInProgress += 1;
      }

      for (const room of project.rooms) {
        if (isRoomCompletedToday(room.phases, dayStartIso, dayEndIso)) {
          roomsCompletedToday += 1;
        }
      }
    }

    return {
      overall_progress_percent:
        totalPhases === 0
          ? 0
          : Math.round((completedPhases / totalPhases) * 100),
      completed_phases: completedPhases,
      total_phases: totalPhases,
      projects_in_progress: projectsInProgress,
      rooms_completed_today: roomsCompletedToday,
      hours_worked_today_label: formatWorkDurationMinutes(hoursWorkedTodayMinutes),
    };
  }

  async syncProjectCompletion(projectId: string): Promise<void> {
    const snapshot = await this.repository.findProjectProgressSnapshot(projectId);

    if (!snapshot) {
      return;
    }

    const progress = calculateProjectProgress(snapshot.rooms);

    if (!progress.is_completed) {
      return;
    }

    if (snapshot.engagement_status === "completed") {
      return;
    }

    await this.repository.updateProjectEngagementStatus(projectId, "completed");
  }
}
