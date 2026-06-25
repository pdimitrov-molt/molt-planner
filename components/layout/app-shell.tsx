import { SidebarNavigation } from "@/components/layout/sidebar-navigation";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <SidebarNavigation />
      <div className="flex min-w-0 flex-1 flex-col bg-background">{children}</div>
    </div>
  );
}
