"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { navItems } from "./nav-items";

export interface SidebarProps {
  onNavigate?: () => void;
  className?: string;
}

export function Sidebar({ onNavigate, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-1 p-3", className)} aria-label="Navegação principal">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg py-2 pr-3 pl-4 text-sm font-medium transition-colors",
              isActive
                ? "bg-brand-accent/10 text-brand-navy dark:text-white"
                : "text-brand-graphite hover:bg-black/[.04] dark:text-brand-graphite-light dark:hover:bg-white/[.06]",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-brand-accent transition-opacity",
                isActive ? "opacity-100" : "opacity-0",
              )}
            />
            <Icon
              className={cn(
                "h-5 w-5 shrink-0 transition-colors",
                isActive ? "text-brand-accent" : "text-brand-graphite-light",
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
