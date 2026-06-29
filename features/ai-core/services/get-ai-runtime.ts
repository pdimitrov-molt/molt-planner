import { DummyAIProvider } from "@/features/ai-core/providers/DummyAIProvider";
import { AIRuntime } from "@/features/ai-core/runtime/AIRuntime";

let aiRuntime: AIRuntime | null = null;

export function getAIRuntime(): AIRuntime {
  if (!aiRuntime) {
    aiRuntime = new AIRuntime(new DummyAIProvider());
  }

  return aiRuntime;
}
