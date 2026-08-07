"use client";

import { ReactNode, useEffect, useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/brand/Logo";
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
    <div className="flex min-h-screen flex-col">
      <Header onMenuClick={() => setIsMobileNavOpen(true)} />

      <div className="flex flex-1">
        <aside
          className={cn(
            "hidden shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 lg:flex",
            isCollapsed ? "w-16" : "w-64",
          )}
        >
          <div
            className={cn(
              "flex h-16 shrink-0 items-center border-b border-border",
              isCollapsed ? "justify-center px-2" : "px-4",
            )}
          >
            {isCollapsed ? (
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-accent text-sm font-bold text-white">
                L
              </span>
            ) : (
              <Logo height={24} />
            )}
          </div>

          <Sidebar collapsed={isCollapsed} className="flex-1" />

          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? "Expandir menu" : "Retrair menu"}
            className={cn(
              "flex items-center gap-2 border-t border-border py-3 text-sm font-medium text-brand-graphite-light transition-colors hover:bg-black/[.03] hover:text-foreground",
              isCollapsed ? "justify-center px-2" : "px-4",
            )}
          >
            <Icon
              name="left_panel_close"
              className={cn("shrink-0 transition-transform", isCollapsed && "rotate-180")}
              size={18}
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
            <div className="relative z-50 flex h-full w-64 flex-col bg-surface">
              <div className="flex h-16 items-center justify-between border-b border-border px-4">
                <Logo height={24} />
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(false)}
                  aria-label="Fechar menu de navegação"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-brand-graphite-light hover:bg-black/[.03] hover:text-foreground"
                >
                  <Icon name="close" />
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
