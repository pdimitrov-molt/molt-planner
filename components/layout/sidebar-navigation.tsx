"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalculatorIcon,
  FolderKanbanIcon,
  HomeIcon,
  PlusIcon,
  SettingsIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

const NAV_ITEMS = [
  { href: "/", label: bg.nav.home, icon: HomeIcon },
  { href: "/projects", label: bg.nav.projects, icon: FolderKanbanIcon },
  { href: "/projects/new", label: bg.nav.newProject, icon: PlusIcon },
  { href: "/intake", label: bg.nav.planner, icon: CalculatorIcon },
  { href: "/settings", label: bg.nav.settings, icon: SettingsIcon },
] as const;

function isNavItemActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNavigation() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="px-5 py-6">
        <Link
          href="/"
          className="flex flex-col gap-1 transition-opacity hover:opacity-80"
        >
          <span className="text-base font-semibold tracking-tight text-sidebar-foreground">
            {bg.common.brand}
          </span>
          <span className="text-caption text-sidebar-foreground/60">
            {bg.common.brandTagline}
          </span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 pb-6">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = isNavItemActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )}
            >
              {isActive ? (
                <span
                  aria-hidden
                  className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-sidebar-primary"
                />
              ) : null}
              <Icon className="size-4 shrink-0 opacity-80" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
