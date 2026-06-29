export interface AIToolInputSchema {
  type: "object";
  properties: Record<string, unknown>;
  required?: string[];
}

export interface AIToolCall {
  name: string;
  input: Record<string, unknown>;
}

export interface ValidatedToolCall {
  name: string;
  input: Record<string, unknown>;
}

export interface AITool {
  name: string;
  description: string;
  inputSchema: AIToolInputSchema;
  execute(input: Record<string, unknown>): Promise<unknown> | unknown;
}
