"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export interface HelpTooltipProps {
  text: string;
  className?: string;
}

// Balão de ajuda por clique (não por hover) — mais previsível em telas touch,
// onde "hover" não existe. Fecha ao clicar fora ou apertar Esc.
export function HelpTooltip({ text, className }: HelpTooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <span ref={ref} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Ajuda"
        aria-expanded={open}
        className="flex h-5 w-5 items-center justify-center rounded-full text-brand-graphite-light hover:text-brand-accent"
      >
        <Icon name="help" size={16} />
      </button>

      {open && (
        <div className="absolute top-full left-1/2 z-20 mt-2 w-72 -translate-x-1/2">
          <div className="relative rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed font-normal text-foreground shadow-lg">
            {text}
            <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-t border-l border-border bg-surface" />
          </div>
        </div>
      )}
    </span>
  );
}
