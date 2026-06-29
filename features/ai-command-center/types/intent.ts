export enum AIIntentType {
  CREATE_PROJECT_TASK = "CREATE_PROJECT_TASK",
  CREATE_PERSONAL_ITEM = "CREATE_PERSONAL_ITEM",
  CREATE_WAITING_EVENT = "CREATE_WAITING_EVENT",
  CREATE_MEETING = "CREATE_MEETING",
  CREATE_REMINDER = "CREATE_REMINDER",
  COMPLETE_STAGE = "COMPLETE_STAGE",
  START_TIMER = "START_TIMER",
  STOP_TIMER = "STOP_TIMER",
  UNKNOWN = "UNKNOWN",
}

export type AIIntentEntities = Record<string, unknown>;

export interface AIIntent {
  intent: AIIntentType;
  confidence: number;
  entities: AIIntentEntities;
  raw: string;
}
