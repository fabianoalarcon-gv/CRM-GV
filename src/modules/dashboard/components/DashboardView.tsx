"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SEGMENTO_OPTIONS } from "@/modules/pipeline/types";
import {
  applyFilters,
  computeConversionRates,
  computeForecast,
  computeFunnelStages,
  computeMonthlyAggregates,
  computeStatusAggregates,
  formatCurrency,
  rankTopPropostas,
} from "../utils";
import { KpiCard } from "./KpiCard";
import { MonthlyBarChart } from "./MonthlyBarChart";
import { RankingTable } from "./RankingTable";
import { SalesFunnel } from "./SalesFunnel";
import type { DashboardFilters, DashboardProposta, StatusKey } from "../types";

const TODOS_OPTION = { value: "", label: "Todos" };

const TIPO_FILTER_OPTIONS = [
  TODOS_OPTION,
  { value: "fixo", label: "Fixo" },
  { value: "spot", label: "Spot" },
];

const SEGMENTO_FILTER_OPTIONS = [TODOS_OPTION, ...SEGMENTO_OPTIONS];

const TERMOMETRO_FILTER_OPTIONS = [
  TODOS_OPTION,
  { value: "frio", label: "Frio" },
  { value: "morno", label: "Morno" },
  { value: "quente", label: "Quente" },
];

const EMPTY_FILTERS: DashboardFilters = {
  dataInicio: "",
  dataFim: "",
  tipoServico: "",
  segmento: "",
  servico: "",
  termometro: "",
};

export interface DashboardViewProps {
  propostas: DashboardProposta[];
  statusLabels: Partial<Record<StatusKey, string>>;
}

export function DashboardView({ propostas, statusLabels }: DashboardViewProps) {
  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_FILTERS);

  const servicoOptions = useMemo(() => {
    const values = new Set<string>();
    for (const p of propostas) {
      if (p.servico) values.add(p.servico);
    }
    return [
      TODOS_OPTION,
      ...Array.from(values)
        .sort((a, b) => a.localeCompare(b, "pt-BR"))
        .map((v) => ({ value: v, label: v })),
    ];
  }, [propostas]);

  const filtered = useMemo(() => applyFilters(propostas, filters), [propostas, filters]);
  const statusAggregates = useMemo(
    () => computeStatusAggregates(filtered, statusLabels),
    [filtered, statusLabels],
  );
  const rates = useMemo(() => computeConversionRates(filtered), [filtered]);
  const monthly = useMemo(() => computeMonthlyAggregates(filtered), [filtered]);
  const forecast = useMemo(() => computeForecast(filtered, rates), [filtered, rates]);
  const funnelStages = useMemo(() => computeFunnelStages(statusAggregates), [statusAggregates]);
  const ranking = useMemo(() => rankTopPropostas(filtered, 5), [filtered]);

  const valorTotal = statusAggregates.reduce((acc, a) => acc + a.valor, 0);
  const qtdTotal = filtered.length;

  const propostasAndamento = filtered.filter((p) => p.status_key !== "fechado");
  const valorAndamento = propostasAndamento.reduce((acc, p) => acc + p.valor, 0);
  const qtdAndamento = propostasAndamento.length;

  const propostasAprovadas = filtered.filter((p) => p.resultado === "aprovado");
  const valorAprovado = propostasAprovadas.reduce((acc, p) => acc + p.valor, 0);
  const qtdAprovado = propostasAprovadas.length;

  const propostasReprovadas = filtered.filter((p) => p.resultado === "reprovado");
  const valorReprovado = propostasReprovadas.reduce((acc, p) => acc + p.valor, 0);
  const qtdReprovado = propostasReprovadas.length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">
            Visão geral
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Dashboard Comercial
          </h1>
          <p className="mt-2 text-sm text-brand-graphite-light">
            Dashboard com indicadores comercias.
          </p>
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
            label="Tipo"
            value={filters.tipoServico}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                tipoServico: e.target.value as DashboardFilters["tipoServico"],
              }))
            }
            options={TIPO_FILTER_OPTIONS}
            className="w-32"
          />
          <Select
            label="Segmento"
            value={filters.segmento}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                segmento: e.target.value as DashboardFilters["segmento"],
              }))
            }
            options={SEGMENTO_FILTER_OPTIONS}
            className="w-36"
          />
          <Select
            label="Serviço"
            value={filters.servico}
            onChange={(e) => setFilters((prev) => ({ ...prev, servico: e.target.value }))}
            options={servicoOptions}
            className="w-40"
          />
          <Select
            label="Termômetro"
            value={filters.termometro}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                termometro: e.target.value as DashboardFilters["termometro"],
              }))
            }
            options={TERMOMETRO_FILTER_OPTIONS}
            className="w-32"
          />
          {(filters.dataInicio ||
            filters.dataFim ||
            filters.tipoServico ||
            filters.segmento ||
            filters.servico ||
            filters.termometro) && (
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              title="Limpar filtros"
              aria-label="Limpar filtros"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-brand-graphite-light hover:text-brand-accent"
            >
              <Icon name="close" size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Valor total em propostas"
          value={formatCurrency(valorTotal)}
          caption={`${qtdTotal} proposta${qtdTotal === 1 ? "" : "s"}`}
          icon="payments"
          color="var(--color-brand-accent)"
          borderClassName="border-brand-accent/30 bg-brand-accent/5"
          accent
        />
        <KpiCard
          label="Em andamento"
          value={formatCurrency(valorAndamento)}
          caption={`${qtdAndamento} proposta${qtdAndamento === 1 ? "" : "s"}`}
          icon="hourglass_top"
          color="var(--color-temp-frio)"
          borderClassName="border-temp-frio/30 bg-temp-frio/5"
        />
        <KpiCard
          label="Aprovado"
          value={formatCurrency(valorAprovado)}
          caption={`${qtdAprovado} proposta${qtdAprovado === 1 ? "" : "s"}`}
          icon="check_circle"
          color="var(--color-status-aprovado)"
          borderClassName="border-status-aprovado/30 bg-status-aprovado/5"
        />
        <KpiCard
          label="Reprovado"
          value={formatCurrency(valorReprovado)}
          caption={`${qtdReprovado} proposta${qtdReprovado === 1 ? "" : "s"}`}
          icon="cancel"
          color="var(--color-temp-quente)"
          borderClassName="border-temp-quente/30 bg-temp-quente/5"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Taxa de conversão"
          value={rates.taxaConversao !== null ? `${(rates.taxaConversao * 100).toFixed(0)}%` : "—"}
          caption="Aprovadas ÷ (aprovadas + reprovadas)"
          icon="trending_up"
          color="var(--color-status-aprovado)"
        />
        <KpiCard
          label="Taxa de reprovação"
          value={rates.taxaReprovacao !== null ? `${(rates.taxaReprovacao * 100).toFixed(0)}%` : "—"}
          caption="Reprovadas ÷ (aprovadas + reprovadas)"
          icon="trending_down"
          color="var(--color-temp-quente)"
        />
        <KpiCard
          label="Previsão de receita"
          value={formatCurrency(forecast.valor)}
          caption={
            forecast.temHistorico
              ? `Aprovado + (em andamento × ${(forecast.taxaUsada * 100).toFixed(0)}% de conversão histórica)`
              : "Aprovado + 50% do valor em andamento (ainda sem propostas decididas para calcular a taxa real)"
          }
          icon="insights"
          color="var(--color-cal-embarque)"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MonthlyBarChart monthly={monthly} />
        <SalesFunnel stages={funnelStages} />
      </div>

      <RankingTable propostas={ranking} />
    </div>
  );
}
