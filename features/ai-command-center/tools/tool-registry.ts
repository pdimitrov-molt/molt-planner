import type { ToolDefinition } from "@/features/ai-command-center/tools/tool-definition";
import {
  EMPTY_TOOL_INPUT_SCHEMA,
  throwNotImplemented,
  ToolCategory,
} from "@/features/ai-command-center/tools/tool-types";

function createStubTool(
  definition: Omit<ToolDefinition, "execute" | "inputSchema"> & {
    inputSchema?: ToolDefinition["inputSchema"];
  }
): ToolDefinition {
  return {
    inputSchema: definition.inputSchema ?? EMPTY_TOOL_INPUT_SCHEMA,
    ...definition,
    execute() {
      throwNotImplemented();
    },
  };
}

const STUB_TOOLS: ToolDefinition[] = [
  createStubTool({
    id: "create_personal_item",
    name: "create_personal_item",
    description: "Create a personal item.",
    category: ToolCategory.PERSONAL,
    enabled: true,
  }),
  createStubTool({
    id: "create_project_task",
    name: "create_project_task",
    description: "Create a project task.",
    category: ToolCategory.PROJECT,
    enabled: true,
  }),
  createStubTool({
    id: "complete_stage",
    name: "complete_stage",
    description: "Complete the current workflow stage.",
    category: ToolCategory.PROJECT,
    enabled: true,
  }),
  createStubTool({
    id: "start_timer",
    name: "start_timer",
    description: "Start a work session timer.",
    category: ToolCategory.TIMER,
    enabled: true,
  }),
  createStubTool({
    id: "stop_timer",
    name: "stop_timer",
    description: "Stop the active work session timer.",
    category: ToolCategory.TIMER,
    enabled: true,
  }),
  createStubTool({
    id: "search_projects",
    name: "search_projects",
    description: "Search projects.",
    category: ToolCategory.SEARCH,
    enabled: true,
  }),
  createStubTool({
    id: "search_rooms",
    name: "search_rooms",
    description: "Search rooms.",
    category: ToolCategory.SEARCH,
    enabled: true,
  }),
  createStubTool({
    id: "search_workflow",
    name: "search_workflow",
    description: "Search workflow stages and instances.",
    category: ToolCategory.SEARCH,
    enabled: true,
  }),
  createStubTool({
    id: "create_waiting_event",
    name: "create_waiting_event",
    description: "Put a workflow stage on waiting.",
    category: ToolCategory.WAITING,
    enabled: true,
  }),
  createStubTool({
    id: "create_meeting",
    name: "create_meeting",
    description: "Create a meeting.",
    category: ToolCategory.MEETING,
    enabled: true,
  }),
  createStubTool({
    id: "plan_today",
    name: "plan_today",
    description: "Plan today's schedule.",
    category: ToolCategory.PLANNER,
    enabled: true,
  }),
  createStubTool({
    id: "summarize_dashboard",
    name: "summarize_dashboard",
    description: "Summarize the studio dashboard.",
    category: ToolCategory.PLANNER,
    enabled: true,
  }),
  createStubTool({
    id: "estimate_capacity",
    name: "estimate_capacity",
    description: "Estimate studio capacity.",
    category: ToolCategory.PLANNER,
    enabled: true,
  }),
  createStubTool({
    id: "search_items",
    name: "search_items",
    description: "Search personal and project items.",
    category: ToolCategory.SEARCH,
    enabled: true,
  }),
  createStubTool({
    id: "move_deadline",
    name: "move_deadline",
    description: "Move a project deadline.",
    category: ToolCategory.PROJECT,
    enabled: true,
  }),
  createStubTool({
    id: "create_note",
    name: "create_note",
    description: "Create a note.",
    category: ToolCategory.SYSTEM,
    enabled: true,
  }),
];

export class ToolRegistry {
  private readonly tools = new Map<string, ToolDefinition>();

  constructor(tools: ToolDefinition[] = STUB_TOOLS) {
    for (const tool of tools) {
      this.register(tool);
    }
  }

  register(tool: ToolDefinition): void {
    this.tools.set(tool.id, tool);
  }

  get(id: string): ToolDefinition | undefined {
    return this.tools.get(id);
  }

  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  getEnabled(): ToolDefinition[] {
    return this.getAll().filter((tool) => tool.enabled);
  }

  getByCategory(category: ToolCategory): ToolDefinition[] {
    return this.getAll().filter((tool) => tool.category === category);
  }

  has(id: string): boolean {
    return this.tools.has(id);
  }
}

export const toolRegistry = new ToolRegistry();
