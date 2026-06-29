import type { ValidatedToolCall } from "@/features/ai-command-center/tools/ai-tool";

export interface AIPlanStep {
  toolCall: ValidatedToolCall;
}

export interface AIPlan {
  steps: AIPlanStep[];
  raw: string;
}
