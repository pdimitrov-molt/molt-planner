export interface ExecutionResult {
  success: boolean;
  toolName: string;
  output: unknown;
  error?: string;
}
