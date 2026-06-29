import type { AIGateway, AIResponse } from "@/features/ai-command-center/types/ai-gateway";

export class DummyGateway implements AIGateway {
  interpret(command: string): AIResponse {
    return {
      success: true,
      intent: "UNKNOWN",
      confidence: 0,
      payload: null,
      raw: command,
    };
  }
}

export const dummyGateway = new DummyGateway();

export function logGatewayResponse(response: AIResponse): void {
  console.table(response);
}
