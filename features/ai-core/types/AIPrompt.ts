import type { AIContext } from "@/features/ai-core/types/AIContext";

export interface AIPrompt {
  system: string;
  user: string;
  context: AIContext;
}
