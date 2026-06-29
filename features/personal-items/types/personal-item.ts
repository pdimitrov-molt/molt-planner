export const PERSONAL_ITEM_CATEGORIES = [
  "personal",
  "shopping",
  "reminder",
  "phone_call",
  "meeting",
  "errand",
  "health",
  "family",
  "finance",
  "travel",
  "goal",
  "other",
] as const;

export const PERSONAL_ITEM_STATUSES = [
  "TODO",
  "IN_PROGRESS",
  "DONE",
  "CANCELLED",
] as const;

export const PERSONAL_ITEM_PRIORITIES = [
  "low",
  "normal",
  "high",
  "urgent",
] as const;

export type PersonalItemCategory = (typeof PERSONAL_ITEM_CATEGORIES)[number];
export type PersonalItemStatus = (typeof PERSONAL_ITEM_STATUSES)[number];
export type PersonalItemPriority = (typeof PERSONAL_ITEM_PRIORITIES)[number];

export interface PersonalItem {
  id: string;
  title: string;
  description: string | null;
  category: PersonalItemCategory;
  priority: PersonalItemPriority;
  status: PersonalItemStatus;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PersonalItemRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface CreatePersonalItemInput {
  title: string;
  description?: string | null;
  category?: PersonalItemCategory;
  priority?: PersonalItemPriority;
  status?: PersonalItemStatus;
  due_date?: string | null;
}

export interface UpdatePersonalItemInput {
  id: string;
  title?: string;
  description?: string | null;
  category?: PersonalItemCategory;
  priority?: PersonalItemPriority;
  status?: PersonalItemStatus;
  due_date?: string | null;
  completed_at?: string | null;
}

export type PersonalItemWritePayload = {
  title: string;
  description: string | null;
  category: PersonalItemCategory;
  priority: PersonalItemPriority;
  status: PersonalItemStatus;
  due_date: string | null;
  completed_at: string | null;
};

export type PersonalItemUpdatePayload = Partial<PersonalItemWritePayload>;

export function isPersonalItemCategory(value: string): value is PersonalItemCategory {
  return PERSONAL_ITEM_CATEGORIES.includes(value as PersonalItemCategory);
}

export function isPersonalItemStatus(value: string): value is PersonalItemStatus {
  return PERSONAL_ITEM_STATUSES.includes(value as PersonalItemStatus);
}

export function isPersonalItemPriority(value: string): value is PersonalItemPriority {
  return PERSONAL_ITEM_PRIORITIES.includes(value as PersonalItemPriority);
}

export function mapPersonalItemRow(row: PersonalItemRow): PersonalItem {
  if (!isPersonalItemCategory(row.category)) {
    throw new Error(`Invalid personal item category: ${row.category}`);
  }

  if (!isPersonalItemStatus(row.status)) {
    throw new Error(`Invalid personal item status: ${row.status}`);
  }

  if (!isPersonalItemPriority(row.priority)) {
    throw new Error(`Invalid personal item priority: ${row.priority}`);
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    priority: row.priority,
    status: row.status,
    due_date: row.due_date,
    completed_at: row.completed_at,
    created_at: row.created_at,
    updated_at: row.updated_at ?? row.created_at,
    deleted_at: row.deleted_at,
  };
}

export function normalizeCreatePersonalItemInput(
  input: CreatePersonalItemInput
): PersonalItemWritePayload {
  const title = input.title.trim();

  if (!title) {
    throw new Error("Personal item title is required.");
  }

  const category = input.category ?? "personal";
  const priority = input.priority ?? "normal";
  const status = input.status ?? "TODO";

  if (!isPersonalItemCategory(category)) {
    throw new Error(`Invalid personal item category: ${category}`);
  }

  if (!isPersonalItemPriority(priority)) {
    throw new Error(`Invalid personal item priority: ${priority}`);
  }

  if (!isPersonalItemStatus(status)) {
    throw new Error(`Invalid personal item status: ${status}`);
  }

  return {
    title,
    description: input.description?.trim() || null,
    category,
    priority,
    status,
    due_date: input.due_date ?? null,
    completed_at: status === "DONE" ? new Date().toISOString() : null,
  };
}

export function normalizeUpdatePersonalItemInput(
  input: UpdatePersonalItemInput
): PersonalItemUpdatePayload {
  const payload: PersonalItemUpdatePayload = {};

  if (input.title !== undefined) {
    const title = input.title.trim();

    if (!title) {
      throw new Error("Personal item title is required.");
    }

    payload.title = title;
  }

  if (input.description !== undefined) {
    payload.description = input.description?.trim() || null;
  }

  if (input.category !== undefined) {
    if (!isPersonalItemCategory(input.category)) {
      throw new Error(`Invalid personal item category: ${input.category}`);
    }

    payload.category = input.category;
  }

  if (input.priority !== undefined) {
    if (!isPersonalItemPriority(input.priority)) {
      throw new Error(`Invalid personal item priority: ${input.priority}`);
    }

    payload.priority = input.priority;
  }

  if (input.status !== undefined) {
    if (!isPersonalItemStatus(input.status)) {
      throw new Error(`Invalid personal item status: ${input.status}`);
    }

    payload.status = input.status;

    if (input.status === "DONE") {
      payload.completed_at = input.completed_at ?? new Date().toISOString();
    } else {
      payload.completed_at = null;
    }
  } else if (input.completed_at !== undefined) {
    payload.completed_at = input.completed_at;
  }

  if (input.due_date !== undefined) {
    payload.due_date = input.due_date;
  }

  return payload;
}
