import type { DashboardFilters, DashboardProposta, StatusKey } from "./types";

export const STATUS_ORDER: StatusKey[] = ["em_analise", "aprovado", "reprovado"];

export const STATUS_COLORS: Record<StatusKey, string> = {
  em_analise: "var(--color-temp-frio)",
  aprovado: "var(--color-status-aprovado)",
  reprovado: "var(--color-temp-quente)",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatCompactCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)} mi`;
  if (Math.abs(value) >= 1_000) return `R$ ${(value / 1_000).toFixed(0)} mil`;
  return currencyFormatter.format(value);
}

export function applyFilters(
  propostas: DashboardProposta[],
  filters: DashboardFilters,
): DashboardProposta[] {
  return propostas.filter((p) => {
    if (filters.dataInicio && p.data_envio < filters.dataInicio) return false;
    if (filters.dataFim && p.data_envio > filters.dataFim) return false;
    if (filters.tipoServico && p.tipo_servico !== filters.tipoServico) return false;
    return true;
  });
}

export interface StatusAggregate {
  status: StatusKey;
  label: string;
  count: number;
  valor: number;
}

export function buildStatusLabelMap(
  propostas: DashboardProposta[],
): Partial<Record<StatusKey, string>> {
  const map: Partial<Record<StatusKey, string>> = {};
  for (const p of propostas) map[p.status_key] = p.status_label;
  return map;
}

export function computeStatusAggregates(
  propostas: DashboardProposta[],
  labelByStatus: Partial<Record<StatusKey, string>> = {},
): StatusAggregate[] {
  const map = new Map<StatusKey, StatusAggregate>();
  for (const key of STATUS_ORDER) {
    map.set(key, { status: key, label: labelByStatus[key] ?? key, count: 0, valor: 0 });
  }
  for (const p of propostas) {
    const agg = map.get(p.status_key);
    if (!agg) continue;
    agg.count += 1;
    agg.valor += p.valor;
  }
  return STATUS_ORDER.map((key) => map.get(key)!);
}

export interface ConversionRates {
  taxaConversao: number | null;
  taxaReprovacao: number | null;
}

export function computeConversionRates(statusAggregates: StatusAggregate[]): ConversionRates {
  const aprovado = statusAggregates.find((s) => s.status === "aprovado")?.count ?? 0;
  const reprovado = statusAggregates.find((s) => s.status === "reprovado")?.count ?? 0;
  const decididas = aprovado + reprovado;

  if (decididas === 0) return { taxaConversao: null, taxaReprovacao: null };

  return {
    taxaConversao: aprovado / decididas,
    taxaReprovacao: reprovado / decididas,
  };
}

export interface MonthlyAggregate {
  monthKey: string;
  label: string;
  count: number;
  valor: number;
}

const monthLabelFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit" });

export function computeMonthlyAggregates(propostas: DashboardProposta[]): MonthlyAggregate[] {
  const map = new Map<string, MonthlyAggregate>();

  for (const p of propostas) {
    const date = new Date(`${p.data_envio}T00:00:00`);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const existing = map.get(monthKey);
    if (existing) {
      existing.count += 1;
      existing.valor += p.valor;
    } else {
      map.set(monthKey, {
        monthKey,
        label: monthLabelFormatter.format(date),
        count: 1,
        valor: p.valor,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
}

export function computeForecast(statusAggregates: StatusAggregate[], rates: ConversionRates) {
  const aprovado = statusAggregates.find((s) => s.status === "aprovado");
  const emAnalise = statusAggregates.find((s) => s.status === "em_analise");
  const valorAprovado = aprovado?.valor ?? 0;
  const valorEmAnalise = emAnalise?.valor ?? 0;

  const taxaUsada = rates.taxaConversao ?? 0.5;
  const previsao = valorAprovado + valorEmAnalise * taxaUsada;

  return {
    valor: previsao,
    temHistorico: rates.taxaConversao !== null,
    taxaUsada,
  };
}

export function rankTopPropostas(
  propostas: DashboardProposta[],
  limit = 5,
): DashboardProposta[] {
  return [...propostas].sort((a, b) => b.valor - a.valor).slice(0, limit);
}
