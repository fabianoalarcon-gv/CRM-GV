"use client";

import { ReactNode, useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Logo } from "@/components/brand/Logo";

export function AppShell({ children }: { children: ReactNode }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Header onMenuClick={() => setIsMobileNavOpen(true)} />

      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-surface lg:block">
          <Sidebar />
        </aside>

        {isMobileNavOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              role="presentation"
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMobileNavOpen(false)}
            />
            <div className="relative z-50 flex h-full w-64 flex-col bg-surface">
              <div className="flex h-16 items-center justify-between border-b border-border px-4">
                <Logo height={24} />
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(false)}
                  aria-label="Fechar menu de navegação"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-brand-graphite hover:bg-black/[.04] dark:text-brand-graphite-light dark:hover:bg-white/[.06]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="h-5 w-5"
                  >
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <Sidebar onNavigate={() => setIsMobileNavOpen(false)} />
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
