import type { AIProvider } from "@/features/ai-core/types/AIProvider";
import type { AIPrompt } from "@/features/ai-core/types/AIPrompt";
import type { AIResponse } from "@/features/ai-core/types/AIResponse";

export abstract class BaseAIProvider implements AIProvider {
  abstract generate(prompt: AIPrompt): Promise<AIResponse> | AIResponse;
}
