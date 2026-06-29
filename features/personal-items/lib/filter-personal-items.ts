import { isBefore, isToday, parseISO, startOfDay } from "date-fns";

import type {
  PersonalItem,
  PersonalItemCategory,
  PersonalItemPriority,
  PersonalItemStatus,
} from "@/features/personal-items/types/personal-item";

export type PersonalItemDueDateFilter =
  | "all"
  | "overdue"
  | "today"
  | "upcoming"
  | "none";

export interface PersonalItemFilters {
  category: PersonalItemCategory | "all";
  priority: PersonalItemPriority | "all";
  status: PersonalItemStatus | "all";
  dueDate: PersonalItemDueDateFilter;
}

export const DEFAULT_PERSONAL_ITEM_FILTERS: PersonalItemFilters = {
  category: "all",
  priority: "all",
  status: "all",
  dueDate: "all",
};

function matchesDueDateFilter(
  item: PersonalItem,
  dueDateFilter: PersonalItemDueDateFilter
): boolean {
  if (dueDateFilter === "all") {
    return true;
  }

  if (!item.due_date) {
    return dueDateFilter === "none";
  }

  const due = startOfDay(parseISO(item.due_date));
  const today = startOfDay(new Date());

  if (dueDateFilter === "none") {
    return false;
  }

  if (dueDateFilter === "today") {
    return isToday(due);
  }

  if (dueDateFilter === "overdue") {
    return isBefore(due, today) && item.status !== "DONE" && item.status !== "CANCELLED";
  }

  if (dueDateFilter === "upcoming") {
    return !isBefore(due, today);
  }

  return true;
}

export function filterPersonalItems(
  items: PersonalItem[],
  filters: PersonalItemFilters
): PersonalItem[] {
  return items.filter((item) => {
    if (filters.category !== "all" && item.category !== filters.category) {
      return false;
    }

    if (filters.priority !== "all" && item.priority !== filters.priority) {
      return false;
    }

    if (filters.status !== "all" && item.status !== filters.status) {
      return false;
    }

    return matchesDueDateFilter(item, filters.dueDate);
  });
}

export function hasActivePersonalItemFilters(filters: PersonalItemFilters): boolean {
  return (
    filters.category !== "all" ||
    filters.priority !== "all" ||
    filters.status !== "all" ||
    filters.dueDate !== "all"
  );
}
