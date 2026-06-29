import type {
  ToolCategory,
  ToolExecuteInput,
  ToolInputSchema,
} from "@/features/ai-command-center/tools/tool-types";

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  inputSchema: ToolInputSchema;
  execute(input: ToolExecuteInput): Promise<unknown> | unknown;
  enabled: boolean;
}
