import type { AIContext } from "@/features/ai-command-center/context/ai-context";
import type { ExecutionResult } from "@/features/ai-command-center/executor/execution-result";
import type { AIResponse } from "@/features/ai-command-center/types/ai-gateway";

import type { AIPlan } from "./ai-plan";

export interface AIAgent {
  interpret(command: string, context: AIContext): Promise<AIResponse> | AIResponse;
  plan(
    command: string,
    context: AIContext,
    response: AIResponse
  ): Promise<AIPlan> | AIPlan;
  execute(plan: AIPlan, context: AIContext): Promise<ExecutionResult> | ExecutionResult;
}
