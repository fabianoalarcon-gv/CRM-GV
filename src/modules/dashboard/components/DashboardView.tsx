"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  applyFilters,
  buildStatusLabelMap,
  computeConversionRates,
  computeForecast,
  computeMonthlyAggregates,
  computeStatusAggregates,
  formatCurrency,
  rankTopPropostas,
} from "../utils";
import { KpiCard } from "./KpiCard";
import { MonthlyBarChart } from "./MonthlyBarChart";
import { RankingTable } from "./RankingTable";
import { SalesFunnel } from "./SalesFunnel";
import { StatusBarChart } from "./StatusBarChart";
import type { DashboardFilters, DashboardProposta } from "../types";

const TIPO_SERVICO_OPTIONS = [
  { value: "fixo", label: "Fixo" },
  { value: "spot", label: "Spot" },
];

const EMPTY_FILTERS: DashboardFilters = { dataInicio: "", dataFim: "", tipoServico: "" };

export interface DashboardViewProps {
  propostas: DashboardProposta[];
}

export function DashboardView({ propostas }: DashboardViewProps) {
  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_FILTERS);

  const filtered = useMemo(() => applyFilters(propostas, filters), [propostas, filters]);
  const statusLabels = useMemo(() => buildStatusLabelMap(propostas), [propostas]);
  const statusAggregates = useMemo(
    () => computeStatusAggregates(filtered, statusLabels),
    [filtered, statusLabels],
  );
  const rates = useMemo(() => computeConversionRates(statusAggregates), [statusAggregates]);
  const monthly = useMemo(() => computeMonthlyAggregates(filtered), [filtered]);
  const forecast = useMemo(() => computeForecast(statusAggregates, rates), [statusAggregates, rates]);
  const ranking = useMemo(() => rankTopPropostas(filtered, 5), [filtered]);

  const valorTotal = statusAggregates.reduce((acc, a) => acc + a.valor, 0);
  const valorEmAnalise = statusAggregates.find((a) => a.status === "em_analise")?.valor ?? 0;
  const valorAprovado = statusAggregates.find((a) => a.status === "aprovado")?.valor ?? 0;
  const valorReprovado = statusAggregates.find((a) => a.status === "reprovado")?.valor ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">
            Visão geral
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Dashboard Comercial
          </h1>
          <p className="mt-2 text-sm text-brand-graphite-light">
            Acompanhamento do pipeline de propostas da Granvale Logística.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Input
          label="De"
          type="date"
          value={filters.dataInicio}
          onChange={(e) => setFilters((prev) => ({ ...prev, dataInicio: e.target.value }))}
          className="w-40"
        />
        <Input
          label="Até"
          type="date"
          value={filters.dataFim}
          onChange={(e) => setFilters((prev) => ({ ...prev, dataFim: e.target.value }))}
          className="w-40"
        />
        <Select
          label="Tipo de serviço"
          placeholder="Todos os tipos"
          value={filters.tipoServico}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              tipoServico: e.target.value as DashboardFilters["tipoServico"],
            }))
          }
          options={TIPO_SERVICO_OPTIONS}
          className="w-40"
        />
        {(filters.dataInicio || filters.dataFim || filters.tipoServico) && (
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="h-10 text-sm text-brand-graphite-light hover:text-brand-accent"
          >
            Limpar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Valor total em propostas" value={formatCurrency(valorTotal)} accent />
        <KpiCard label="Em análise" value={formatCurrency(valorEmAnalise)} />
        <KpiCard label="Aprovado" value={formatCurrency(valorAprovado)} />
        <KpiCard label="Reprovado" value={formatCurrency(valorReprovado)} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Taxa de conversão"
          value={rates.taxaConversao !== null ? `${(rates.taxaConversao * 100).toFixed(0)}%` : "—"}
          caption="Aprovadas ÷ (aprovadas + reprovadas)"
        />
        <KpiCard
          label="Taxa de reprovação"
          value={rates.taxaReprovacao !== null ? `${(rates.taxaReprovacao * 100).toFixed(0)}%` : "—"}
          caption="Reprovadas ÷ (aprovadas + reprovadas)"
        />
        <KpiCard
          label="Previsão de receita"
          value={formatCurrency(forecast.valor)}
          caption={
            forecast.temHistorico
              ? `Aprovado + (Em análise × ${(forecast.taxaUsada * 100).toFixed(0)}% de conversão histórica)`
              : "Aprovado + 50% do Em análise (ainda sem propostas decididas para calcular a taxa real)"
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StatusBarChart aggregates={statusAggregates} />
        <SalesFunnel aggregates={statusAggregates} />
      </div>

      <MonthlyBarChart monthly={monthly} />

      <RankingTable propostas={ranking} />
    </div>
  );
}
