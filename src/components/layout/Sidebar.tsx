"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { useIsAdmin } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/client";
import { adminNavItems, navItems, type NavItem } from "./nav-items";

export interface SidebarProps {
  onNavigate?: () => void;
  collapsed?: boolean;
  className?: string;
}

export function Sidebar({ onNavigate, collapsed = false, className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = useIsAdmin();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className={cn("flex flex-col gap-1 p-3", className)} aria-label="Navegação principal">
      <div className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-1 border-t border-border pt-2">
        {isAdmin &&
          adminNavItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={pathname === item.href}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "Sair" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg py-2 text-sm font-medium text-temp-quente transition-colors hover:bg-temp-quente/10",
            collapsed ? "justify-center px-2" : "pr-3 pl-4",
          )}
        >
          <Icon name="logout" className="shrink-0" size={20} />
          {!collapsed && "Sair"}
        </button>
      </div>
    </nav>
  );
}

function NavLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors",
        collapsed ? "justify-center px-2" : "pr-3 pl-4",
        active
          ? "bg-brand-accent/10 text-brand-accent"
          : "text-brand-graphite hover:bg-black/[.03] hover:text-foreground",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-full bg-brand-accent transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />
      <Icon
        name={item.icon}
        className={cn("shrink-0", active ? "text-brand-accent" : "text-brand-graphite-light group-hover:text-foreground")}
        size={20}
      />
      {!collapsed && item.label}
    </Link>
  );
}
