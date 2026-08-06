"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
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

      {/* Placeholder até o módulo AUTH definir usuário/sessão real */}
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-navy text-sm font-medium text-white">
        U
      </div>
    </header>
  );
}
