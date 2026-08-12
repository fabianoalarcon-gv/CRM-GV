"use client";

import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SEGMENTO_OPTIONS, type Termometro } from "@/modules/pipeline/types";
import { EMPTY_LEAD_FILTERS, type LeadFilters } from "../utils";

// "Todos" entra como opção normal (não placeholder) pra continuar
// selecionável depois de escolher um valor específico.
const TERMOMETRO_FILTER_OPTIONS: { value: Termometro | ""; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "frio", label: "Frio" },
  { value: "morno", label: "Morno" },
  { value: "quente", label: "Quente" },
];

const SEGMENTO_FILTER_OPTIONS = [{ value: "", label: "Todos" }, ...SEGMENTO_OPTIONS];

export interface LeadFiltersBarProps {
  value: LeadFilters;
  onChange: (value: LeadFilters) => void;
}

export function LeadFiltersBar({ value, onChange }: LeadFiltersBarProps) {
  const hasActiveFilters =
    value.dataInicio || value.dataFim || value.termometro || value.segmento;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Input
        label="Criado de"
        type="date"
        value={value.dataInicio}
        onChange={(e) => onChange({ ...value, dataInicio: e.target.value })}
        className="w-32"
      />
      <Input
        label="Criado até"
        type="date"
        value={value.dataFim}
        onChange={(e) => onChange({ ...value, dataFim: e.target.value })}
        className="w-32"
      />
      <Select
        label="Termômetro"
        value={value.termometro}
        onChange={(e) => onChange({ ...value, termometro: e.target.value as LeadFilters["termometro"] })}
        options={TERMOMETRO_FILTER_OPTIONS}
        className="w-32"
      />
      <Select
        label="Segmento"
        value={value.segmento}
        onChange={(e) => onChange({ ...value, segmento: e.target.value as LeadFilters["segmento"] })}
        options={SEGMENTO_FILTER_OPTIONS}
        className="w-36"
      />
      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => onChange(EMPTY_LEAD_FILTERS)}
          title="Limpar filtros"
          aria-label="Limpar filtros"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-brand-graphite-light hover:text-brand-accent"
        >
          <Icon name="filter_alt_off" size={20} />
        </button>
      )}
    </div>
  );
}
