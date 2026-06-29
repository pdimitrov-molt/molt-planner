import type { AIIntent } from "@/features/ai-command-center/types/intent";

export interface IntentParser {
  parse(raw: string): AIIntent;
}
