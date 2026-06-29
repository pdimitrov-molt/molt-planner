"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsUpDownIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const SIDEBAR_WIDTH = 250;

const NAV_ITEMS = [
  { href: "/", label: "Начало", emoji: "🏠" },
  { href: "/inbox", label: "Inbox", emoji: "📥" },
  { href: "/today", label: "Днес", emoji: "☀️" },
  { href: "/projects", label: "Проекти", emoji: "📁" },
  { href: "/projects/new", label: "Нов проект", emoji: "➕" },
  { href: "/intake", label: "Планер", emoji: "📅" },
  { href: "/personal", label: "Лични задачи", emoji: "✅" },
  { href: "/waiting", label: "Изчакване", emoji: "⏱" },
  { href: "/capacity", label: "Капацитет", emoji: "📊" },
  { href: "/reports", label: "Отчети", emoji: "📈" },
  { href: "/settings", label: "Настройки", emoji: "⚙" },
] as const;

const SIDEBAR_USER = {
  name: "Алекс Мартинов",
  role: "Ръководител студио",
  initials: "АМ",
};

function isNavItemActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/projects") {
    return (
      pathname === "/projects" ||
      (pathname.startsWith("/projects/") && !pathname.startsWith("/projects/new"))
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarUserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left outline-none transition-colors hover:bg-sidebar-accent/60 focus-visible:ring-2 focus-visible:ring-sidebar-ring/40"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
          {SIDEBAR_USER.initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-sidebar-foreground">
            {SIDEBAR_USER.name}
          </span>
          <span className="block truncate text-xs text-sidebar-foreground/60">
            {SIDEBAR_USER.role}
          </span>
        </span>
        <ChevronsUpDownIcon className="size-4 shrink-0 text-sidebar-foreground/50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuItem>Профил</DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">Настройки</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Изход</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SidebarNavigation() {
  const pathname = usePathname();

  return (
    <>
      <aside
        className="fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <div className="px-5 py-6">
          <Link
            href="/"
            className="flex flex-col gap-1 transition-opacity hover:opacity-80"
          >
            <span className="text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground">
              MOLT DESIGN GROUP
            </span>
            <span className="text-sm text-sidebar-foreground/60">Studio OS</span>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = isNavItemActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-sidebar-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )}
              >
                {isActive ? (
                  <span
                    aria-hidden
                    className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary"
                  />
                ) : null}
                <span aria-hidden className="text-base leading-none">
                  {item.emoji}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <SidebarUserMenu />
        </div>
      </aside>

      <div
        aria-hidden
        className="shrink-0"
        style={{ width: SIDEBAR_WIDTH }}
      />
    </>
  );
}
