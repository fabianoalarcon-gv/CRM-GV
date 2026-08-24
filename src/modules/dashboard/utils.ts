import { ORIGEM_LEAD_OPTIONS } from "@/modules/empresas/constants";
import { TIPO_LABEL } from "@/modules/calendario/utils";
import type { Captacao } from "@/modules/captacao/types";
import {
  LEADS_STATUS_KEYS,
  PIPELINE_STATUS_KEYS,
  SEGMENTO_OPTIONS,
  type Termometro,
} from "@/modules/pipeline/types";
import type {
  DashboardAcao,
  DashboardEmpresaCadastro,
  DashboardFilters,
  DashboardProposta,
  DashboardStatusHistoricoEntry,
  StatusKey,
} from "./types";

const LEADS_STATUS_KEY_SET = new Set<string>(LEADS_STATUS_KEYS);
const PIPELINE_STATUS_KEY_SET = new Set<string>(PIPELINE_STATUS_KEYS);

export const STATUS_ORDER: StatusKey[] = [
  "prospeccao",
  "qualificacao",
  "proposta",
  "negociacao",
  "fechado",
];

// Estágios exibidos no menu Pipeline — usado tanto pra filtrar os registros
// dos indicadores de Propostas quanto pra limitar o Funil de Vendas a essas
// 3 etapas (Prospecção/Qualificação são etapas de Lead, não de Pipeline).
export const PIPELINE_STATUS_ORDER: StatusKey[] = ["proposta", "negociacao", "fechado"];

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatCompactCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)} mi`;
  if (Math.abs(value) >= 1_000) return `R$ ${(value / 1_000).toFixed(0)} mil`;
  return currencyFormatter.format(value);
}

// `dateStr` aceita tanto uma data pura (YYYY-MM-DD, ex: data_envio) quanto um
// timestamp completo (ex: created_at de Captação/Empresa) — só a parte de
// data é comparada, senão um registro no último dia do período ficaria de
// fora só por ter hora/minuto depois de "YYYY-MM-DD" na comparação de string.
export function inDateRange(dateStr: string, dataInicio: string, dataFim: string): boolean {
  const day = dateStr.slice(0, 10);
  if (dataInicio && day < dataInicio) return false;
  if (dataFim && day > dataFim) return false;
  return true;
}

export function applyFilters(
  propostas: DashboardProposta[],
  filters: DashboardFilters,
): DashboardProposta[] {
  return propostas.filter((p) => {
    if (!inDateRange(p.data_envio, filters.dataInicio, filters.dataFim)) return false;
    if (filters.tipoServico && p.tipo_servico !== filters.tipoServico) return false;
    if (filters.segmento && p.segmento !== filters.segmento) return false;
    if (filters.servico && p.servico !== filters.servico) return false;
    if (filters.termometro && p.termometro !== filters.termometro) return false;
    return true;
  });
}

function formatDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Período padrão ao abrir o Dashboard: últimos 90 dias (em vez do histórico
// inteiro) — o usuário ainda pode limpar/ajustar "De"/"Até" livremente.
export function defaultDashboardFilters(): DashboardFilters {
  const hoje = new Date();
  const inicio = new Date(hoje);
  inicio.setDate(inicio.getDate() - 90);
  return {
    dataInicio: formatDateInput(inicio),
    dataFim: formatDateInput(hoje),
    tipoServico: "",
    segmento: "",
    servico: "",
    termometro: "",
  };
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
  order: StatusKey[] = STATUS_ORDER,
): StatusAggregate[] {
  const map = new Map<StatusKey, StatusAggregate>();
  for (const key of order) {
    map.set(key, { status: key, label: labelByStatus[key] ?? key, count: 0, valor: 0 });
  }
  for (const p of propostas) {
    const agg = map.get(p.status_key);
    if (!agg) continue;
    agg.count += 1;
    agg.valor += p.valor;
  }
  return order.map((key) => map.get(key)!);
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
  const map = new Map<Termometro, { count: number; valor: number }>(
    TERMOMETRO_ORDER.map((t) => [t, { count: 0, valor: 0 }]),
  );
  // Propostas/Leads sem termômetro definido não entram no total — senão o
  // percentual das categorias reais somaria menos de 100%.
  let total = 0;
  for (const p of propostas) {
    if (!p.termometro) continue;
    const entry = map.get(p.termometro);
    if (!entry) continue;
    entry.count += 1;
    entry.valor += p.valor;
    total += 1;
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

// Um registro só existe no menu Pipeline a partir do estágio "Proposta" em
// diante — os mesmos 3 estágios do Funil de Vendas.
export function isPipelineRecord(p: DashboardProposta): boolean {
  return PIPELINE_STATUS_KEY_SET.has(p.status_key);
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

// Conta EMPRESAS distintas por origem, não propostas/leads — uma empresa com
// vários registros (leads e/ou propostas) não pode contar várias vezes a
// mesma origem, senão o gráfico infla artificialmente quem tem mais volume.
export function computeOrigemBreakdown(propostas: DashboardProposta[]): CategoryBreakdown[] {
  const origemPorEmpresa = new Map<number, string | null>();
  for (const p of propostas) {
    if (!origemPorEmpresa.has(p.empresa_id)) origemPorEmpresa.set(p.empresa_id, p.origem_lead);
  }
  const total = origemPorEmpresa.size;

  const map = new Map<string, { label: string; count: number }>();
  for (const o of ORIGEM_LEAD_OPTIONS) map.set(o.value, { label: o.label, count: 0 });

  let semOrigem = 0;
  for (const origem of origemPorEmpresa.values()) {
    if (origem && map.has(origem)) {
      map.get(origem)!.count += 1;
    } else {
      semOrigem += 1;
    }
  }

  const result: CategoryBreakdown[] = [];
  for (const [key, v] of map) {
    if (v.count > 0) {
      result.push({
        key,
        label: v.label,
        count: v.count,
        valor: 0,
        pct: total > 0 ? v.count / total : 0,
      });
    }
  }
  if (semOrigem > 0) {
    result.push({
      key: "sem_origem",
      label: "Sem origem",
      count: semOrigem,
      valor: 0,
      pct: total > 0 ? semOrigem / total : 0,
    });
  }
  return result;
}

export function formatDaysLegend(avgDays: number, amostras: number): string {
  return `${Math.round(avgDays)} dias em média · ${amostras} amostra${amostras === 1 ? "" : "s"}`;
}

export function formatEmpresaLegend(count: number): string {
  return `${count} Empresa${count === 1 ? "" : "s"}`;
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

// --- Indicadores de Captação ---

// Mesmo agrupamento por mês dos gráficos de Propostas/Leads, usando a data de
// criação do registro de Captação (não há campo de valor em Captação, então
// só "count" faz sentido aqui).
export function computeCaptacaoMonthlyAggregates(captacoes: Captacao[]): MonthlyAggregate[] {
  const map = new Map<string, MonthlyAggregate>();

  for (const c of captacoes) {
    const date = new Date(c.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const existing = map.get(monthKey);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(monthKey, { monthKey, label: monthLabelFormatter.format(date), count: 1, valor: 0 });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
}

export interface EmpresaLeadMonthly {
  monthKey: string;
  label: string;
  cadastradas: number;
  semLead: number;
}

// Cruza TODA Empresa já cadastrada (não só quem ainda está em `captacoes` —
// essa tabela perde a linha assim que a Empresa vira Lead) com o conjunto de
// Empresas que já têm ao menos um registro em `propostas`, pra mostrar, mês a
// mês, quantas ainda ficaram só no cadastro, sem nenhum Lead criado.
export function computeEmpresaLeadMonthlyEvolution(
  empresas: DashboardEmpresaCadastro[],
  propostas: DashboardProposta[],
): EmpresaLeadMonthly[] {
  const empresasComLead = new Set(propostas.map((p) => p.empresa_id));
  const map = new Map<string, EmpresaLeadMonthly>();

  for (const e of empresas) {
    const date = new Date(e.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const existing = map.get(monthKey) ?? {
      monthKey,
      label: monthLabelFormatter.format(date),
      cadastradas: 0,
      semLead: 0,
    };
    existing.cadastradas += 1;
    if (!empresasComLead.has(e.id)) existing.semLead += 1;
    map.set(monthKey, existing);
  }

  return Array.from(map.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
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
