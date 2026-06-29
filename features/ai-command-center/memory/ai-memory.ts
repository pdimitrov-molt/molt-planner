export interface AIMemoryEntry {
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

export interface AIMemory {
  entries: AIMemoryEntry[];
}
