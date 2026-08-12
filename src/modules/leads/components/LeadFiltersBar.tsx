"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SEGMENTO_OPTIONS, type Termometro } from "@/modules/pipeline/types";
import { EMPTY_LEAD_FILTERS, type LeadFilters } from "../utils";

const TERMOMETRO_OPTIONS: { value: Termometro; label: string }[] = [
  { value: "frio", label: "Frio" },
  { value: "morno", label: "Morno" },
  { value: "quente", label: "Quente" },
];

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
        className="w-40"
      />
      <Input
        label="Criado até"
        type="date"
        value={value.dataFim}
        onChange={(e) => onChange({ ...value, dataFim: e.target.value })}
        className="w-40"
      />
      <Select
        label="Termômetro"
        placeholder="Todos"
        value={value.termometro}
        onChange={(e) => onChange({ ...value, termometro: e.target.value as LeadFilters["termometro"] })}
        options={TERMOMETRO_OPTIONS}
        className="w-32"
      />
      <Select
        label="Segmento"
        placeholder="Todos"
        value={value.segmento}
        onChange={(e) => onChange({ ...value, segmento: e.target.value as LeadFilters["segmento"] })}
        options={SEGMENTO_OPTIONS}
        className="w-36"
      />
      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => onChange(EMPTY_LEAD_FILTERS)}
          className="h-10 text-sm text-brand-graphite-light hover:text-brand-accent"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
