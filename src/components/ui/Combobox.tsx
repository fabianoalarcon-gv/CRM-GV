"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  label?: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  error?: string;
}

// Select customizado (não é um <select> nativo): o painel de opções tem
// altura máxima fixa (~10 itens visíveis) com rolagem pro resto — algo que
// não dá pra controlar de forma confiável no dropdown nativo do navegador.
export function Combobox({ label, required, placeholder = "Selecione...", value, onChange, options, error }: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
          {required && " *"}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          id={id}
          onClick={() => setIsOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-lg border border-border bg-surface px-3 text-left text-sm text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent",
            error && "border-temp-quente focus-visible:ring-temp-quente",
          )}
        >
          <span className={cn("truncate", !selected && "text-brand-graphite-light")}>
            {selected ? selected.label : placeholder}
          </span>
          <Icon name="expand_more" size={18} className="shrink-0 text-brand-graphite-light" />
        </button>

        {isOpen && (
          <ul
            role="listbox"
            aria-labelledby={label ? id : undefined}
            className="absolute z-20 mt-1 max-h-[340px] w-full overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-lg"
          >
            {options.length === 0 && (
              <li className="px-3 py-2 text-sm text-brand-graphite-light">Nenhuma opção cadastrada.</li>
            )}
            {options.map((option) => (
              <li key={option.value} role="option" aria-selected={option.value === value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "block w-full px-3 py-2 text-left text-sm hover:bg-black/[.03]",
                    option.value === value
                      ? "bg-brand-accent/10 font-medium text-brand-accent"
                      : "text-foreground",
                  )}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <span className="text-sm text-temp-quente">{error}</span>}
    </div>
  );
}
