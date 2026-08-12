"use client";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export type BoardViewMode = "kanban" | "lista";

const OPTIONS: { value: BoardViewMode; icon: string; label: string }[] = [
  { value: "kanban", icon: "view_kanban", label: "Visualizar em Kanban" },
  { value: "lista", icon: "view_list", label: "Visualizar em lista" },
];

export function ViewToggle({
  value,
  onChange,
}: {
  value: BoardViewMode;
  onChange: (mode: BoardViewMode) => void;
}) {
  return (
    <div className="flex gap-1 rounded-lg border border-border bg-black/[.02] p-1">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-label={option.label}
          aria-pressed={value === option.value}
          title={option.label}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
            value === option.value
              ? "bg-surface text-brand-accent shadow-sm"
              : "text-brand-graphite-light hover:text-foreground",
          )}
        >
          <Icon name={option.icon} size={18} />
        </button>
      ))}
    </div>
  );
}
