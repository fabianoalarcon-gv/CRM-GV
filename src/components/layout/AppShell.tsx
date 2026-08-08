"use client";

import { ReactNode, useEffect, useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

const COLLAPSE_STORAGE_KEY = "logihub_sidebar_collapsed";

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
    <div className="flex h-screen flex-col overflow-hidden">
      <Header onMenuClick={() => setIsMobileNavOpen(true)} />

      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            "hidden shrink-0 flex-col overflow-hidden border-r border-border bg-surface transition-[width] duration-200 lg:flex",
            isCollapsed ? "w-16" : "w-56",
          )}
        >
          <Sidebar collapsed={isCollapsed} className="min-h-0 flex-1 overflow-y-auto pt-4" />

          <button
            type="button"
            onClick={toggleCollapsed}
            title={isCollapsed ? "Expandir menu" : "Retrair menu"}
            aria-label={isCollapsed ? "Expandir menu" : "Retrair menu"}
            className="flex shrink-0 items-center justify-center gap-2 border-t border-border py-3 text-brand-graphite-light transition-colors hover:bg-black/[.03] hover:text-foreground"
          >
            <Icon
              name="left_panel_close"
              className={cn("shrink-0 transition-transform", isCollapsed && "rotate-180")}
              size={18}
            />
          </button>
        </aside>

        {isMobileNavOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              role="presentation"
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMobileNavOpen(false)}
            />
            <div className="relative z-50 flex h-full w-64 flex-col bg-surface">
              <div className="flex h-16 shrink-0 items-center justify-end border-b border-border px-4">
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(false)}
                  aria-label="Fechar menu de navegação"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-brand-graphite-light hover:bg-black/[.03] hover:text-foreground"
                >
                  <Icon name="close" />
                </button>
              </div>
              <Sidebar
                onNavigate={() => setIsMobileNavOpen(false)}
                className="min-h-0 flex-1 overflow-y-auto pt-4"
              />
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 overflow-auto bg-background p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
