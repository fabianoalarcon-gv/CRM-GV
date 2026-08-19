import { ORIGEM_LEAD_OPTIONS } from "@/modules/empresas/constants";
import { TIPO_LABEL } from "@/modules/calendario/utils";
import { LEADS_STATUS_KEYS, SEGMENTO_OPTIONS, type Termometro } from "@/modules/pipeline/types";
import type {
  DashboardAcao,
  DashboardFilters,
  DashboardProposta,
  DashboardStatusHistoricoEntry,
  StatusKey,
} from "./types";

const LEADS_STATUS_KEY_SET = new Set<string>(LEADS_STATUS_KEYS);

export const STATUS_ORDER: StatusKey[] = [
  "prospeccao",
  "qualificacao",
  "proposta",
  "negociacao",
  "fechado",
];

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
    if (filters.segmento && p.segmento !== filters.segmento) return false;
    if (filters.servico && p.servico !== filters.servico) return false;
    if (filters.termometro && p.termometro !== filters.termometro) return false;
    return true;
  });
}

export interface StatusAggregate {
  status: StatusKey;
  label: string;
  count: number;
  valor: number;
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

export interface FunnelStage {
  status: StatusKey;
  label: string;
  count: number;
  valor: number;
  pct: number;
}

// Funil "cumulativo a partir da direita": como só guardamos o estágio ATUAL de
// cada proposta (não um histórico de por onde ela passou), cada estágio mostra
// "quantas propostas estão neste estágio ou mais adiante" — uma aproximação
// razoável de um funil de verdade sem precisar de uma tabela de histórico.
export function computeFunnelStages(statusAggregates: StatusAggregate[]): FunnelStage[] {
  const total = statusAggregates.reduce((sum, s) => sum + s.count, 0);
  return statusAggregates.map((stage, i) => {
    const atOrLater = statusAggregates.slice(i);
    const countAtOrLater = atOrLater.reduce((sum, s) => sum + s.count, 0);
    const valorAtOrLater = atOrLater.reduce((sum, s) => sum + s.valor, 0);
    return {
      status: stage.status,
      label: stage.label,
      count: countAtOrLater,
      valor: valorAtOrLater,
      pct: total > 0 ? countAtOrLater / total : 0,
    };
  });
}

export interface ConversionRates {
  taxaConversao: number | null;
  taxaReprovacao: number | null;
}

export function computeConversionRates(propostas: DashboardProposta[]): ConversionRates {
  const aprovado = propostas.filter((p) => p.resultado === "aprovado").length;
  const reprovado = propostas.filter((p) => p.resultado === "reprovado").length;
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

export function computeForecast(propostas: DashboardProposta[], rates: ConversionRates) {
  const valorAprovado = propostas
    .filter((p) => p.resultado === "aprovado")
    .reduce((sum, p) => sum + p.valor, 0);
  const valorEmAndamento = propostas
    .filter((p) => p.resultado === null)
    .reduce((sum, p) => sum + p.valor, 0);

  const taxaUsada = rates.taxaConversao ?? 0.5;
  const previsao = valorAprovado + valorEmAndamento * taxaUsada;

  return {
    valor: previsao,
    temHistorico: rates.taxaConversao !== null,
    taxaUsada,
  };
}

export function rankTopPropostas(propostas: DashboardProposta[], limit = 5): DashboardProposta[] {
  return [...propostas].sort((a, b) => b.valor - a.valor).slice(0, limit);
}

export interface CategoryBreakdown {
  key: string;
  label: string;
  count: number;
  valor: number;
  pct: number;
}

export function formatCount(count: number): string {
  const proposta = count === 1 ? "Proposta" : "Propostas";
  return `${count} ${proposta}`;
}

// Sem o percentual — ele agora é mostrado direto em cima da cor de cada
// fatia/faixa do gráfico, não repetido aqui na legenda.
export function formatBreakdownLegend(count: number, valor: number): string {
  return `${formatCount(count)} - ${formatCurrency(valor)}`;
}

export function computeSegmentoBreakdown(propostas: DashboardProposta[]): CategoryBreakdown[] {
  const total = propostas.length;
  const map = new Map<string, { label: string; count: number; valor: number }>();
  for (const seg of SEGMENTO_OPTIONS) map.set(seg.value, { label: seg.label, count: 0, valor: 0 });

  let semSegmento = { count: 0, valor: 0 };
  for (const p of propostas) {
    if (p.segmento) {
      const entry = map.get(p.segmento)!;
      entry.count += 1;
      entry.valor += p.valor;
    } else {
      semSegmento = { count: semSegmento.count + 1, valor: semSegmento.valor + p.valor };
    }
  }

  const result: CategoryBreakdown[] = [];
  for (const [key, v] of map) {
    if (v.count > 0) {
      result.push({
        key,
        label: v.label,
        count: v.count,
        valor: v.valor,
        pct: total > 0 ? v.count / total : 0,
      });
    }
  }
  if (semSegmento.count > 0) {
    result.push({
      key: "sem_segmento",
      label: "Sem segmento",
      count: semSegmento.count,
      valor: semSegmento.valor,
      pct: total > 0 ? semSegmento.count / total : 0,
    });
  }
  return result;
}

// Serviço é texto livre (sem lista fixa) — mostra os N mais frequentes e
// agrupa o restante em "Outros" pra não estourar o número de fatias do gráfico.
export function computeServicoBreakdown(
  propostas: DashboardProposta[],
  limit = 5,
): CategoryBreakdown[] {
  const total = propostas.length;
  const map = new Map<string, { count: number; valor: number }>();
  let semServico = { count: 0, valor: 0 };

  for (const p of propostas) {
    const key = p.servico?.trim();
    if (!key) {
      semServico = { count: semServico.count + 1, valor: semServico.valor + p.valor };
      continue;
    }
    const entry = map.get(key) ?? { count: 0, valor: 0 };
    entry.count += 1;
    entry.valor += p.valor;
    map.set(key, entry);
  }

  const sorted = Array.from(map.entries())
    .map(([key, v]) => ({ key, label: key, count: v.count, valor: v.valor }))
    .sort((a, b) => b.count - a.count);

  const top = sorted.slice(0, limit);
  const rest = sorted.slice(limit);
  const outros = rest.reduce(
    (acc, r) => ({ count: acc.count + r.count, valor: acc.valor + r.valor }),
    { count: 0, valor: 0 },
  );

  const toPct = (count: number) => (total > 0 ? count / total : 0);

  const result: CategoryBreakdown[] = top.map((t) => ({ ...t, pct: toPct(t.count) }));
  if (outros.count > 0) {
    result.push({
      key: "outros",
      label: "Outros",
      count: outros.count,
      valor: outros.valor,
      pct: toPct(outros.count),
    });
  }
  if (semServico.count > 0) {
    result.push({
      key: "sem_servico",
      label: "Sem serviço",
      count: semServico.count,
      valor: semServico.valor,
      pct: toPct(semServico.count),
    });
  }
  return result;
}

export interface TermometroBreakdown {
  termometro: Termometro;
  label: string;
  count: number;
  valor: number;
  pct: number;
}

const TERMOMETRO_ORDER: Termometro[] = ["quente", "morno", "frio"];
const TERMOMETRO_LABEL: Record<Termometro, string> = {
  quente: "Quente",
  morno: "Morno",
  frio: "Frio",
};

export function computeTermometroBreakdown(propostas: DashboardProposta[]): TermometroBreakdown[] {
  const total = propostas.length;
  const map = new Map<Termometro, { count: number; valor: number }>(
    TERMOMETRO_ORDER.map((t) => [t, { count: 0, valor: 0 }]),
  );
  for (const p of propostas) {
    const entry = map.get(p.termometro);
    if (!entry) continue;
    entry.count += 1;
    entry.valor += p.valor;
  }
  return TERMOMETRO_ORDER.map((t) => {
    const v = map.get(t)!;
    return {
      termometro: t,
      label: TERMOMETRO_LABEL[t],
      count: v.count,
      valor: v.valor,
      pct: total > 0 ? v.count / total : 0,
    };
  });
}

// --- Indicadores de Leads ---

export function isLeadRecord(p: DashboardProposta): boolean {
  return LEADS_STATUS_KEY_SET.has(p.status_key);
}

// Mesmo agrupamento por mês do gráfico de propostas, mas usando a data de
// início do Lead (campo que o usuário controla) em vez da data de envio da
// proposta — mostra quando o Lead entrou, não quando virou proposta formal.
export function computeLeadMonthlyAggregates(propostas: DashboardProposta[]): MonthlyAggregate[] {
  const map = new Map<string, MonthlyAggregate>();

  for (const p of propostas) {
    const date = new Date(`${p.data_inicio_lead}T00:00:00`);
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

export function computeOrigemBreakdown(propostas: DashboardProposta[]): CategoryBreakdown[] {
  const total = propostas.length;
  const map = new Map<string, { label: string; count: number; valor: number }>();
  for (const o of ORIGEM_LEAD_OPTIONS) map.set(o.value, { label: o.label, count: 0, valor: 0 });

  let semOrigem = { count: 0, valor: 0 };
  for (const p of propostas) {
    if (p.origem_lead && map.has(p.origem_lead)) {
      const entry = map.get(p.origem_lead)!;
      entry.count += 1;
      entry.valor += p.valor;
    } else {
      semOrigem = { count: semOrigem.count + 1, valor: semOrigem.valor + p.valor };
    }
  }

  const result: CategoryBreakdown[] = [];
  for (const [key, v] of map) {
    if (v.count > 0) {
      result.push({
        key,
        label: v.label,
        count: v.count,
        valor: v.valor,
        pct: total > 0 ? v.count / total : 0,
      });
    }
  }
  if (semOrigem.count > 0) {
    result.push({
      key: "sem_origem",
      label: "Sem origem",
      count: semOrigem.count,
      valor: semOrigem.valor,
      pct: total > 0 ? semOrigem.count / total : 0,
    });
  }
  return result;
}

// Mesmo ranking de RankingTable, mas só entre registros que ainda estão no
// menu Leads (Prospecção/Qualificação/Arquivado) — uma proposta já promovida
// pro Pipeline não conta mais como Lead.
export function rankTopLeads(propostas: DashboardProposta[], limit = 5): DashboardProposta[] {
  return rankTopPropostas(propostas.filter(isLeadRecord), limit);
}

export function formatDaysLegend(avgDays: number, amostras: number): string {
  return `${avgDays.toFixed(1)} dias em média · ${amostras} amostra${amostras === 1 ? "" : "s"}`;
}

// Tempo médio entre duas ações CONSECUTIVAS DA MESMA CATEGORIA no mesmo
// Lead/Proposta (ex: quantos dias em média se passam entre uma ligação e a
// próxima, no mesmo registro) — não entre categorias diferentes. Reaproveita
// CategoryBreakdown: `count` guarda a média em dias (é o que dimensiona a
// fatia do gráfico), `valor` guarda o nº de intervalos medidos.
export function computeAcaoIntervalBreakdown(acoes: DashboardAcao[]): CategoryBreakdown[] {
  const byPropostaTipo = new Map<string, string[]>();
  for (const a of acoes) {
    if (!a.tipo) continue;
    const key = `${a.proposta_id}|${a.tipo}`;
    const arr = byPropostaTipo.get(key) ?? [];
    arr.push(a.inicio);
    byPropostaTipo.set(key, arr);
  }

  const diffsByTipo = new Map<string, number[]>();
  for (const [key, inicios] of byPropostaTipo) {
    if (inicios.length < 2) continue;
    const tipo = key.slice(key.indexOf("|") + 1);
    const sorted = [...inicios].sort();
    for (let i = 1; i < sorted.length; i++) {
      const diffDays =
        (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86_400_000;
      const arr = diffsByTipo.get(tipo) ?? [];
      arr.push(diffDays);
      diffsByTipo.set(tipo, arr);
    }
  }

  const entries = Array.from(diffsByTipo.entries()).map(([tipo, diffs]) => ({
    tipo,
    avgDays: diffs.reduce((sum, d) => sum + d, 0) / diffs.length,
    amostras: diffs.length,
  }));

  const totalAvgDays = entries.reduce((sum, e) => sum + e.avgDays, 0);

  return entries
    .sort((a, b) => b.avgDays - a.avgDays)
    .map((e) => ({
      key: e.tipo,
      label: TIPO_LABEL[e.tipo as keyof typeof TIPO_LABEL] ?? e.tipo,
      count: e.avgDays,
      valor: e.amostras,
      pct: totalAvgDays > 0 ? e.avgDays / totalAvgDays : 0,
    }));
}

export interface StageDuration {
  status: StatusKey;
  label: string;
  avgDays: number;
  amostras: number;
}

const STAGE_DURATION_TARGETS: StatusKey[] = ["prospeccao", "negociacao"];

// Duração de um estágio = diferença entre a linha do histórico e a próxima da
// mesma proposta (ou "agora", se for a mais recente — ainda em andamento
// nesse estágio). `allowedIds`, quando informado, restringe às propostas do
// conjunto filtrado no momento (mesmo padrão dos outros indicadores da
// página).
export function computeStageDurations(
  historico: DashboardStatusHistoricoEntry[],
  allowedIds: Set<number> | null,
  statusLabels: Partial<Record<StatusKey, string>>,
): StageDuration[] {
  const byProposta = new Map<number, DashboardStatusHistoricoEntry[]>();
  for (const h of historico) {
    if (allowedIds && !allowedIds.has(h.proposta_id)) continue;
    const arr = byProposta.get(h.proposta_id) ?? [];
    arr.push(h);
    byProposta.set(h.proposta_id, arr);
  }

  const now = Date.now();
  const daysByStatus = new Map<StatusKey, number[]>();

  for (const entries of byProposta.values()) {
    const sorted = [...entries].sort((a, b) => a.entrou_em.localeCompare(b.entrou_em));
    for (let i = 0; i < sorted.length; i++) {
      const start = new Date(sorted[i].entrou_em).getTime();
      const end = i + 1 < sorted.length ? new Date(sorted[i + 1].entrou_em).getTime() : now;
      const days = (end - start) / 86_400_000;
      const arr = daysByStatus.get(sorted[i].status_key) ?? [];
      arr.push(days);
      daysByStatus.set(sorted[i].status_key, arr);
    }
  }

  return STAGE_DURATION_TARGETS.map((status) => {
    const days = daysByStatus.get(status) ?? [];
    return {
      status,
      label: statusLabels[status] ?? status,
      avgDays: days.length > 0 ? days.reduce((sum, d) => sum + d, 0) / days.length : 0,
      amostras: days.length,
    };
  });
}
