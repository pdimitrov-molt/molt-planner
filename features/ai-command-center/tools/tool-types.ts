export enum ToolCategory {
  PROJECT = "PROJECT",
  PERSONAL = "PERSONAL",
  MEETING = "MEETING",
  WAITING = "WAITING",
  REMINDER = "REMINDER",
  TIMER = "TIMER",
  SEARCH = "SEARCH",
  PLANNER = "PLANNER",
  SYSTEM = "SYSTEM",
}

export interface ToolInputSchema {
  type: "object";
  properties: Record<string, unknown>;
  required?: string[];
}

export type ToolExecuteInput = Record<string, unknown>;

export const EMPTY_TOOL_INPUT_SCHEMA: ToolInputSchema = {
  type: "object",
  properties: {},
  required: [],
};

export const NOT_IMPLEMENTED_ERROR = "Not implemented";

export function throwNotImplemented(): never {
  throw new Error(NOT_IMPLEMENTED_ERROR);
}
