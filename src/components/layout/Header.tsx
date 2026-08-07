"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { useCurrentUser } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/client";
import type { Role } from "@/lib/auth/types";

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
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-border bg-surface px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menu de navegação"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-brand-graphite hover:bg-black/[.04] dark:text-brand-graphite-light dark:hover:bg-white/[.06] lg:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-5 w-5"
          >
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
        <Link href="/" className="flex items-center">
          <Logo height={28} />
        </Link>
      </div>

      {currentUser && (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 hover:bg-black/[.04] dark:hover:bg-white/[.06]"
          >
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
          </button>

          {isMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-lg"
            >
              <div className="border-b border-border px-3 py-2 sm:hidden">
                <p className="text-sm font-medium text-foreground">{currentUser.fullName}</p>
                <p className="text-xs text-brand-graphite-light">{ROLE_LABEL[currentUser.role]}</p>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-black/[.04] dark:hover:bg-white/[.06]"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
