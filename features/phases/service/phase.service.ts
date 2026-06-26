import { PhaseRepository } from "@/features/phases/repository/phase.repository";
import type { Phase } from "@/features/phases/types/phase";
import {
  completePhaseSchema,
  type CompletePhaseInput,
} from "@/features/phases/validation/phase.schema";
import { ProgressService } from "@/features/progress/service/progress.service";
import { RoomRepository } from "@/features/rooms/repository/room.repository";

export class PhaseService {
  constructor(
    private readonly phaseRepository: PhaseRepository,
    private readonly roomRepository: RoomRepository,
    private readonly progressService: ProgressService
  ) {}

  async completePhase(input: CompletePhaseInput): Promise<Phase> {
    const validatedInput = completePhaseSchema.parse(input);
    const roomPhases = await this.phaseRepository.findByRoomIds([
      validatedInput.room_id,
    ]);
    const targetPhase = roomPhases.find(
      (phase) => phase.id === validatedInput.phase_id
    );

    if (!targetPhase) {
      throw new Error("Phase does not belong to this room.");
    }

    if (targetPhase.status === "completed") {
      throw new Error("This phase is already completed.");
    }

    const rooms = await this.roomRepository.findByProjectId(validatedInput.project_id);
    const roomExists = rooms.some((room) => room.id === validatedInput.room_id);

    if (!roomExists) {
      throw new Error("Room does not belong to this project.");
    }

    const completedPhase = await this.phaseRepository.completePhase(
      validatedInput.phase_id
    );

    await this.progressService.syncProjectCompletion(validatedInput.project_id);

    return completedPhase;
  }
}
