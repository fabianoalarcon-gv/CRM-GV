"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  label?: string;
  placeholder?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

// Dropdown de checkboxes — mesmo padrão de fechar-ao-clicar-fora do
// HelpTooltip. Usado nos filtros que passaram a aceitar mais de um valor
// (ex: Segmento), mantendo a mesma altura/API visual do Select de valor
// único (label, placeholder, className).
export function MultiSelect({
  label,
  placeholder = "Todos",
  options,
  value,
  onChange,
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function toggle(optionValue: string) {
    onChange(
      value.includes(optionValue) ? value.filter((v) => v !== optionValue) : [...value, optionValue],
    );
  }

  const firstLabel = options.find((o) => o.value === value[0])?.label;
  const summary =
    value.length === 0 ? placeholder : value.length === 1 ? firstLabel : `${firstLabel} +${value.length - 1}`;

  return (
    <div ref={ref} className={cn("relative flex flex-col gap-1.5", className)}>
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex h-10 items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
      >
        <span className="truncate">{summary}</span>
        <Icon name="expand_more" size={18} className="shrink-0 text-brand-graphite-light" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-20 mt-1 w-full min-w-max rounded-lg border border-border bg-surface p-1 shadow-lg">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-black/[.03]"
            >
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                onChange={() => toggle(option.value)}
                className="h-4 w-4 rounded border-border accent-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent"
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
