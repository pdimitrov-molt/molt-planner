import type { ValidatedToolCall } from "@/features/ai-command-center/tools/ai-tool";

import type { ExecutionResult } from "./execution-result";

export interface AIExecutor {
  run(toolCall: ValidatedToolCall): Promise<ExecutionResult> | ExecutionResult;
}
