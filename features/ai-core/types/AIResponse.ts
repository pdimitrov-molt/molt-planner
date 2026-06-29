import type { AIToolCall } from "@/features/ai-core/types/AIToolCall";

export interface AIResponse {
  success: boolean;
  message: string;
  toolCalls: AIToolCall[];
}
