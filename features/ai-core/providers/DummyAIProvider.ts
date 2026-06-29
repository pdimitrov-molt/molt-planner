import { BaseAIProvider } from "@/features/ai-core/providers/BaseAIProvider";
import type { AIPrompt } from "@/features/ai-core/types/AIPrompt";
import type { AIResponse } from "@/features/ai-core/types/AIResponse";

export class DummyAIProvider extends BaseAIProvider {
  generate(_prompt: AIPrompt): AIResponse {
    return {
      success: true,
      message: "Dummy provider",
      toolCalls: [],
    };
  }
}
