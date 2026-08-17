"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/brand/Logo";
import { useCurrentUser } from "@/lib/auth/context";
import type { Role } from "@/lib/auth/types";
import { NotificationBell } from "@/modules/notificacoes/components/NotificationBell";

export interface HeaderProps {
  onMenuClick: () => void;
}

const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  comercial: "Comercial",
  operacoes: "Operações",
  financeiro: "Financeiro",
};

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "?";
}

export function Header({ onMenuClick }: HeaderProps) {
  const currentUser = useCurrentUser();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menu de navegação"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-brand-graphite hover:bg-black/[.04] lg:hidden"
        >
          <Icon name="menu" />
        </button>
        <Link href="/" className="flex items-center">
          <Logo height={28} />
        </Link>
      </div>

      {currentUser && (
        <div className="ml-auto flex items-center gap-2.5">
          <NotificationBell />
          <span className="hidden text-right sm:block">
            <span className="block text-sm leading-tight font-medium text-foreground">
              {currentUser.fullName}
            </span>
            <span className="block text-xs leading-tight text-brand-graphite-light">
              {ROLE_LABEL[currentUser.role]}
            </span>
          </span>
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-medium text-white"
            title={`${currentUser.fullName} · ${ROLE_LABEL[currentUser.role]}`}
          >
            {initials(currentUser.fullName)}
          </div>
        </div>
      )}
    </header>
  );
}
