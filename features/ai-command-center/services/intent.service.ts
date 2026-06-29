import { AIIntentType, type AIIntent } from "@/features/ai-command-center/types/intent";
import type { IntentParser } from "@/features/ai-command-center/types/intent-parser";

class StubIntentParser implements IntentParser {
  parse(raw: string): AIIntent {
    return {
      intent: AIIntentType.UNKNOWN,
      confidence: 0,
      entities: {},
      raw,
    };
  }
}

const intentParser = new StubIntentParser();

export function parseIntent(raw: string): AIIntent {
  return intentParser.parse(raw);
}

export function logParsedIntent(intent: AIIntent): void {
  console.log(
    `Intent:\n${intent.intent}\n\nConfidence:\n${intent.confidence}\n\nRaw:\n${intent.raw}`
  );
}
