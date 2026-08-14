"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export interface ComboboxOption {
  value: string;
  label: string;
}

// Remove acentos pra comparação de busca (ex: "sao paulo" encontra "São Paulo").
// NFD decompõe cada letra acentuada em base + marca combinante (faixa
// 0x0300-0x036f do Unicode); descartar essa faixa deixa só as letras base.
const COMBINING_MARKS_START = 0x0300;
const COMBINING_MARKS_END = 0x036f;

function normalize(value: string): string {
  let result = "";
  for (const char of value.normalize("NFD")) {
    const code = char.codePointAt(0) ?? 0;
    if (code < COMBINING_MARKS_START || code > COMBINING_MARKS_END) {
      result += char;
    }
  }
  return result.toLowerCase();
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

// Select customizado (não é um <select> nativo): digitar filtra a lista de
// opções, mas só um clique/Enter numa opção da lista atualiza o valor
// selecionado — texto digitado sem selecionar nunca vira o valor salvo (ao
// fechar sem escolher, o campo volta a mostrar a opção já selecionada). O
// painel de opções tem altura máxima (~10 itens visíveis) com rolagem pro
// resto, algo que o dropdown nativo do navegador não permite controlar.
export function Combobox({ label, required, placeholder = "Selecione...", value, onChange, options, error }: ComboboxProps) {
  const selected = options.find((o) => o.value === value);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(selected?.label ?? "");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const listboxId = `${id}-listbox`;

  // Enquanto fechado, o texto exibido vem sempre do value/options atuais —
  // assim o campo reflete mudanças feitas de fora (ex: autopreenchimento por
  // CEP) sem precisar de um efeito pra sincronizar estado interno.
  const displayValue = isOpen ? query : (selected?.label ?? value);

  const filteredOptions = query.trim()
    ? options.filter((o) => normalize(o.label).includes(normalize(query.trim())))
    : options;

  function openWithFreshQuery() {
    setIsOpen(true);
    setQuery("");
    setHighlightedIndex(0);
  }

  function closeAndRevert() {
    setIsOpen(false);
    setQuery(selected?.label ?? "");
  }

  function selectOption(option: ComboboxOption) {
    onChange(option.value);
    setQuery(option.label);
    setIsOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      closeAndRevert();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen) {
        openWithFreshQuery();
        return;
      }
      setHighlightedIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      // Dentro de um <form>, Enter num input dispararia o submit — aqui o
      // significado é "selecionar a opção destacada", nunca enviar texto livre.
      event.preventDefault();
      if (isOpen && filteredOptions[highlightedIndex]) {
        selectOption(filteredOptions[highlightedIndex]);
      }
    }
  }

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
          {required && " *"}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          autoComplete="off"
          value={displayValue}
          placeholder={placeholder}
          onFocus={openWithFreshQuery}
          onClick={() => !isOpen && openWithFreshQuery()}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlightedIndex(0);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onBlur={closeAndRevert}
          className={cn(
            "h-10 w-full rounded-lg border border-border bg-surface px-3 pr-9 text-sm text-foreground placeholder:text-brand-graphite-light",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent",
            error && "border-temp-quente focus-visible:ring-temp-quente",
          )}
        />
        <Icon
          name="expand_more"
          size={18}
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-brand-graphite-light"
        />

        {isOpen && (
          <ul
            id={listboxId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-[340px] w-full overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-lg"
          >
            {filteredOptions.length === 0 && (
              <li className="px-3 py-2 text-sm text-brand-graphite-light">Nenhum resultado encontrado.</li>
            )}
            {filteredOptions.map((option, index) => (
              <li key={option.value} role="option" aria-selected={option.value === value}>
                <button
                  type="button"
                  // Evita que o input perca foco (e feche/reverta) antes do clique registrar.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectOption(option)}
                  className={cn(
                    "block w-full px-3 py-2 text-left text-sm",
                    index === highlightedIndex ? "bg-black/[.05]" : "hover:bg-black/[.03]",
                    option.value === value ? "font-medium text-brand-accent" : "text-foreground",
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
