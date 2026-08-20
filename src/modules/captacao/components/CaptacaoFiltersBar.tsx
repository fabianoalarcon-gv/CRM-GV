"use client";

import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ORIGEM_LEAD_OPTIONS } from "@/modules/empresas/constants";
import { EMPTY_CAPTACAO_FILTERS, type CaptacaoFilters } from "../utils";

const ORIGEM_FILTER_OPTIONS = [{ value: "", label: "Todos" }, ...ORIGEM_LEAD_OPTIONS];

const CONTATO_FILTER_OPTIONS: { value: CaptacaoFilters["contato"]; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
];

export interface CaptacaoFiltersBarProps {
  value: CaptacaoFilters;
  onChange: (value: CaptacaoFilters) => void;
}

export function CaptacaoFiltersBar({ value, onChange }: CaptacaoFiltersBarProps) {
  const hasActiveFilters =
    value.busca || value.dataInicio || value.dataFim || value.origem || value.contato;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Input
        label="Busca"
        placeholder="Nome da empresa..."
        value={value.busca}
        onChange={(e) => onChange({ ...value, busca: e.target.value })}
        icon={<Icon name="search" size={18} />}
        className="w-48"
      />
      <Input
        label="Data Inicial"
        type="date"
        value={value.dataInicio}
        onChange={(e) => onChange({ ...value, dataInicio: e.target.value })}
        className="w-36"
      />
      <Input
        label="Data Final"
        type="date"
        value={value.dataFim}
        onChange={(e) => onChange({ ...value, dataFim: e.target.value })}
        className="w-36"
      />
      <Select
        label="Origem"
        value={value.origem}
        onChange={(e) => onChange({ ...value, origem: e.target.value })}
        options={ORIGEM_FILTER_OPTIONS}
        className="w-36"
      />
      <Select
        label="Contato"
        value={value.contato}
        onChange={(e) => onChange({ ...value, contato: e.target.value as CaptacaoFilters["contato"] })}
        options={CONTATO_FILTER_OPTIONS}
        className="w-28"
      />
      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => onChange(EMPTY_CAPTACAO_FILTERS)}
          title="Limpar filtros"
          aria-label="Limpar filtros"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-brand-graphite-light hover:text-brand-accent"
        >
          <Icon name="close" size={20} />
        </button>
      )}
    </div>
  );
}
