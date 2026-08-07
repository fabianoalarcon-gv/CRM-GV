"use client";

import { ReactNode, useEffect, useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/cn";

const COLLAPSE_STORAGE_KEY = "logihub_sidebar_collapsed";

function CollapseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Lido só depois do mount (não no initial state) para o HTML renderizado no
    // servidor bater com o do cliente antes da preferência salva ser aplicada.
    const stored = window.localStorage.getItem(COLLAPSE_STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === "1") setIsCollapsed(true);
  }, []);

  function toggleCollapsed() {
    setIsCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header onMenuClick={() => setIsMobileNavOpen(true)} />

      <div className="flex flex-1">
        <aside
          className={cn(
            "hidden shrink-0 flex-col bg-brand-navy transition-[width] duration-200 lg:flex",
            isCollapsed ? "w-16" : "w-64",
          )}
        >
          <Sidebar collapsed={isCollapsed} className="flex-1" />
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? "Expandir menu" : "Retrair menu"}
            className={cn(
              "flex items-center gap-2 border-t border-white/10 py-3 text-sm font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white/90",
              isCollapsed ? "justify-center px-2" : "px-4",
            )}
          >
            <CollapseIcon
              className={cn("h-4 w-4 shrink-0 transition-transform", isCollapsed && "rotate-180")}
            />
            {!isCollapsed && "Retrair menu"}
          </button>
        </aside>

        {isMobileNavOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              role="presentation"
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMobileNavOpen(false)}
            />
            <div className="relative z-50 flex h-full w-64 flex-col bg-brand-navy">
              <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
                <Logo height={24} className="!bg-white rounded-md px-2 py-1" />
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(false)}
                  aria-label="Fechar menu de navegação"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/60 hover:bg-white/5 hover:text-white/90"
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

        <main className="flex-1 bg-background p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
