import { cache } from "react";

import { PersonalItemRepository } from "@/features/personal-items/repository/personal-item.repository";
import { PersonalItemService } from "@/features/personal-items/service/personal-item.service";
import type { PersonalItem } from "@/features/personal-items/types/personal-item";
import { getCachedSupabaseServerClient } from "@/lib/server/request-cache";

export const getPersonalItemService = cache(async (): Promise<PersonalItemService> => {
  const database = await getCachedSupabaseServerClient();
  return new PersonalItemService(new PersonalItemRepository(database));
});

export const listPersonalItems = cache(async (): Promise<PersonalItem[]> => {
  const service = await getPersonalItemService();
  return service.listPersonalItems();
});
