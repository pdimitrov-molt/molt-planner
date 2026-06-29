export interface AIResponse {
  success: boolean;
  intent: string;
  confidence: number;
  payload: unknown;
  raw: string;
}

export interface AIGateway {
  interpret(command: string): AIResponse;
}
