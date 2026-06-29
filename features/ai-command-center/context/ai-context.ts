export interface AIContextProject {
  id: string;
  name: string;
}

export interface AIContextWorkflowStage {
  projectId: string;
  phaseId: string;
  groupName: string;
  stageName: string;
}

export interface AIContextTimer {
  sessionId: string;
  projectId: string;
  phaseId: string;
  startedAt: string;
  status: "running" | "paused";
}

export interface AIContextRoom {
  id: string;
  name: string;
  projectId: string;
}

export interface AIContext {
  currentPage: string;
  openedProject: AIContextProject | null;
  openedWorkflowStage: AIContextWorkflowStage | null;
  currentTimer: AIContextTimer | null;
  selectedRoom: AIContextRoom | null;
  todayDate: string;
}
