"use server";

import { revalidatePath } from "next/cache";

import { getPersonalItemService } from "@/features/personal-items/service/get-personal-item-service";
import type {
  CreatePersonalItemInput,
  PersonalItem,
  UpdatePersonalItemInput,
} from "@/features/personal-items/types/personal-item";

export type PersonalItemActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function revalidatePersonalItems() {
  revalidatePath("/personal");
  revalidatePath("/today");
  revalidatePath("/inbox");
}

export async function listPersonalItemsAction(): Promise<
  PersonalItemActionResult<PersonalItem[]>
> {
  try {
    const service = await getPersonalItemService();
    const items = await service.listPersonalItems();
    return { success: true, data: items };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load personal items.",
    };
  }
}

export async function createPersonalItemAction(
  input: CreatePersonalItemInput
): Promise<PersonalItemActionResult<PersonalItem>> {
  try {
    const service = await getPersonalItemService();
    const item = await service.createPersonalItem(input);
    revalidatePersonalItems();
    return { success: true, data: item };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create personal item.",
    };
  }
}

export async function updatePersonalItemAction(
  input: UpdatePersonalItemInput
): Promise<PersonalItemActionResult<PersonalItem>> {
  try {
    const service = await getPersonalItemService();
    const item = await service.updatePersonalItem(input);
    revalidatePersonalItems();
    return { success: true, data: item };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update personal item.",
    };
  }
}

export async function deletePersonalItemAction(
  itemId: string
): Promise<PersonalItemActionResult> {
  try {
    const service = await getPersonalItemService();
    await service.deletePersonalItem(itemId);
    revalidatePersonalItems();
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete personal item.",
    };
  }
}
