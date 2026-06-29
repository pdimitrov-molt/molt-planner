import type { AIPrompt } from "@/features/ai-core/types/AIPrompt";
import type { AIResponse } from "@/features/ai-core/types/AIResponse";

export interface AIProvider {
  generate(prompt: AIPrompt): Promise<AIResponse> | AIResponse;
}
