import { ZodError } from "zod";

import { ClientRepository } from "@/features/clients/repository/client.repository";
import { createClientSchema } from "@/features/clients/validation/client.schema";
import { PhaseRepository } from "@/features/phases/repository/phase.repository";
import { ProjectRepository } from "@/features/projects/repository/project.repository";
import type { Project } from "@/features/projects/types/project";
import {
  normalizeWizardProjectInput,
  projectWizardSchema,
  type ProjectWizardInput,
} from "@/features/projects/validation/project-wizard.schema";
import { RoomRepository } from "@/features/rooms/repository/room.repository";
import { bg } from "@/src/i18n/bg";

export class ProjectCreationService {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly roomRepository: RoomRepository,
    private readonly phaseRepository: PhaseRepository
  ) {}

  async createProjectFromWizard(input: ProjectWizardInput): Promise<Project> {
    const validatedInput = projectWizardSchema.parse(input);
    let createdClientId: string | null = null;
    let createdProjectId: string | null = null;
    let createdRoomIds: string[] = [];

    try {
      const clientId = await this.resolveClientId(validatedInput, (clientIdValue) => {
        createdClientId = clientIdValue;
      });

      const projectPayload = normalizeWizardProjectInput(validatedInput.project);
      const projectNumber = await this.projectRepository.getNextProjectNumber();
      const project = await this.projectRepository.create({
        client_id: clientId,
        project_number: projectNumber,
        ...projectPayload,
      });
      createdProjectId = project.id;

      const roomRecords = RoomRepository.buildCreateRecords(
        project.id,
        validatedInput.rooms
      );
      const rooms = await this.roomRepository.createMany(roomRecords);
      createdRoomIds = rooms.map((room) => room.id);

      const phases = await this.phaseRepository.createDefaultPhasesForRooms(
        createdRoomIds
      );

      for (const room of rooms) {
        const firstPhase = phases
          .filter((phase) => phase.room_id === room.id)
          .sort((left, right) => left.sort_order - right.sort_order)[0];

        if (firstPhase) {
          await this.roomRepository.updateCurrentPhase(room.id, firstPhase.id);
        }
      }

      return project;
    } catch (error) {
      await this.rollback({
        clientId: createdClientId,
        projectId: createdProjectId,
        roomIds: createdRoomIds,
      });
      throw error;
    }
  }

  private async resolveClientId(
    input: ProjectWizardInput,
    onClientCreated: (clientId: string) => void
  ) {
    if (input.client.mode === "existing") {
      const existingClient = await this.clientRepository.findById(
        input.client.client_id
      );

      if (!existingClient) {
        throw new Error("Selected client was not found.");
      }

      return existingClient.id;
    }

    const clientInput = createClientSchema.parse(input.client.client);
    const createdClient = await this.clientRepository.create(clientInput);
    onClientCreated(createdClient.id);
    return createdClient.id;
  }

  private async rollback(context: {
    clientId: string | null;
    projectId: string | null;
    roomIds: string[];
  }) {
    if (context.roomIds.length > 0) {
      await this.phaseRepository.deleteByRoomIds(context.roomIds);
    }

    if (context.projectId) {
      await this.roomRepository.deleteByProjectId(context.projectId);
      await this.projectRepository.softDelete(context.projectId);
    }

    if (context.clientId) {
      await this.clientRepository.softDelete(context.clientId);
    }
  }

  static isValidationError(error: unknown): error is ZodError {
    return error instanceof ZodError;
  }

  static getValidationMessage(error: ZodError): string {
    return error.issues[0]?.message ?? bg.validation.failed;
  }
}
