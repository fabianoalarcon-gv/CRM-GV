"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useIsAdmin } from "@/lib/auth/context";
import { navItems } from "./nav-items";

export interface SidebarProps {
  onNavigate?: () => void;
  collapsed?: boolean;
  className?: string;
}

export function Sidebar({ onNavigate, collapsed = false, className }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = useIsAdmin();
  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <nav className={cn("flex flex-col gap-1 p-3", className)} aria-label="Navegação principal">
      {visibleItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors",
              collapsed ? "justify-center px-2" : "pr-3 pl-4",
              isActive
                ? "bg-white/10 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white/90",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-full bg-brand-accent transition-opacity",
                isActive ? "opacity-100" : "opacity-0",
              )}
            />
            <Icon
              className={cn(
                "h-5 w-5 shrink-0 transition-colors",
                isActive ? "text-brand-accent" : "text-white/50 group-hover:text-white/80",
              )}
            />
            {!collapsed && item.label}
          </Link>
        );
      })}
    </nav>
  );
}
