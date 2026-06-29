import type { AIProvider } from "@/features/ai-core/types/AIProvider";
import type { AIContext } from "@/features/ai-core/types/AIContext";
import type { AIPrompt } from "@/features/ai-core/types/AIPrompt";
import type { AIResponse } from "@/features/ai-core/types/AIResponse";

export interface AIRuntimeInput {
  message: string;
  context?: Record<string, unknown>;
}

export interface AIRuntimeValidationResult {
  valid: boolean;
  errors: string[];
}

export class AIRuntime {
  constructor(private readonly provider: AIProvider) {}

  buildContext(input: AIRuntimeInput = { message: "" }): AIContext {
    return {
      data: input.context ?? {},
    };
  }

  buildPrompt(context: AIContext, message: string): AIPrompt {
    return {
      system: "",
      user: message,
      context,
    };
  }

  callProvider(prompt: AIPrompt): AIResponse {
    const result = this.provider.generate(prompt);

    if (result instanceof Promise) {
      throw new Error("AIRuntime does not execute async providers yet.");
    }

    return result;
  }

  validate(response: AIResponse): AIRuntimeValidationResult {
    if (!response.success) {
      return {
        valid: false,
        errors: ["Response was not successful."],
      };
    }

    return {
      valid: true,
      errors: [],
    };
  }
}
