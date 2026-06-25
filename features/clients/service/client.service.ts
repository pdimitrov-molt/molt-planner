import { ZodError } from "zod";

import { ClientRepository } from "@/features/clients/repository/client.repository";
import type { Client } from "@/features/clients/types/client";
import {
  createClientSchema,
  type CreateClientInput,
} from "@/features/clients/validation/client.schema";
import { bg } from "@/src/i18n/bg";

export class ClientService {
  constructor(private readonly repository: ClientRepository) {}

  async listClients(): Promise<Client[]> {
    return this.repository.findAll();
  }

  async getClient(clientId: string): Promise<Client | null> {
    return this.repository.findById(clientId);
  }

  async createClient(input: CreateClientInput): Promise<Client> {
    const validatedInput = createClientSchema.parse(input);
    return this.repository.create(validatedInput);
  }

  static isValidationError(error: unknown): error is ZodError {
    return error instanceof ZodError;
  }

  static getValidationMessage(error: ZodError): string {
    return error.issues[0]?.message ?? bg.validation.failed;
  }
}
