import { PersonalItemRepository } from "@/features/personal-items/repository/personal-item.repository";
import type {
  CreatePersonalItemInput,
  PersonalItem,
  UpdatePersonalItemInput,
} from "@/features/personal-items/types/personal-item";

export class PersonalItemService {
  constructor(private readonly repository: PersonalItemRepository) {}

  async listPersonalItems(): Promise<PersonalItem[]> {
    return this.repository.findAll();
  }

  async getPersonalItem(itemId: string): Promise<PersonalItem | null> {
    return this.repository.findById(itemId);
  }

  async createPersonalItem(input: CreatePersonalItemInput): Promise<PersonalItem> {
    return this.repository.create(input);
  }

  async updatePersonalItem(input: UpdatePersonalItemInput): Promise<PersonalItem> {
    return this.repository.update(input);
  }

  async deletePersonalItem(itemId: string): Promise<void> {
    return this.repository.softDelete(itemId);
  }
}
