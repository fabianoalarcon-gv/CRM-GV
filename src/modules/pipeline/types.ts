export type Termometro = "frio" | "morno" | "quente";
export type TipoServico = "fixo" | "spot";
export type Resultado = "aprovado" | "reprovado";
export type Segmento = "armazenagem" | "servico" | "transporte";
export type HistoricoTipo = "andamento" | "observacao";

export const SEGMENTO_OPTIONS: { value: Segmento; label: string }[] = [
  { value: "armazenagem", label: "Armazenagem" },
  { value: "servico", label: "Serviço" },
  { value: "transporte", label: "Transporte" },
];

export const SEGMENTO_LABEL: Record<Segmento, string> = Object.fromEntries(
  SEGMENTO_OPTIONS.map((o) => [o.value, o.label]),
) as Record<Segmento, string>;

// Lista fixa de motivos de reprovação (PIPE) — em ordem alfabética, com
// "Outro" ao final (convenção de catch-all, fora da ordem alfabética).
export type MotivoReprovacao =
  | "condicoes_pagamento"
  | "desistencia_cliente"
  | "desistencia_interna"
  | "falta_capacidade"
  | "mudanca_escopo"
  | "prazo_longo"
  | "restricoes"
  | "tarifa_alta"
  | "taxas_adicionais"
  | "outro";

export const MOTIVO_REPROVACAO_OPTIONS: { value: MotivoReprovacao; label: string }[] = [
  { value: "condicoes_pagamento", label: "Condições de pagamento" },
  { value: "desistencia_cliente", label: "Desistência do cliente" },
  { value: "desistencia_interna", label: "Desistência interna" },
  { value: "falta_capacidade", label: "Falta de capacidade" },
  { value: "mudanca_escopo", label: "Mudança de escopo" },
  { value: "prazo_longo", label: "Prazo longo" },
  { value: "restricoes", label: "Restrições" },
  { value: "tarifa_alta", label: "Tarifa alta" },
  { value: "taxas_adicionais", label: "Taxas adicionais" },
  { value: "outro", label: "Outro" },
];

const MOTIVO_REPROVACAO_KEYS = new Set<string>(MOTIVO_REPROVACAO_OPTIONS.map((o) => o.value));

export const MOTIVO_REPROVACAO_DETALHE_MAX_LENGTH = 50;

// Propostas reprovadas antes desta lista fixa existir guardaram o motivo como
// texto livre — não bate com nenhuma chave conhecida. Trata como "Outro" (e
// preserva o texto original como detalhe) em vez de perder a informação já
// registrada.
export function resolveMotivoReprovacaoInicial(
  motivo: string | null,
  detalhe: string | null,
): { motivo: string; detalhe: string } {
  if (!motivo) return { motivo: "", detalhe: "" };
  if (MOTIVO_REPROVACAO_KEYS.has(motivo)) {
    return { motivo, detalhe: motivo === "outro" ? (detalhe ?? "") : "" };
  }
  return { motivo: "outro", detalhe: motivo.slice(0, MOTIVO_REPROVACAO_DETALHE_MAX_LENGTH) };
}

export interface ProposalStatus {
  id: number;
  key: string;
  label: string;
  color: string | null;
  sort_order: number;
  is_default: boolean;
}

// Chaves de status exibidas como colunas em cada board — Leads cobre o
// início do funil, Pipeline as etapas de proposta em diante.
export const LEADS_STATUS_KEYS = ["prospeccao", "qualificacao", "arquivado"] as const;
export const PIPELINE_STATUS_KEYS = ["proposta", "negociacao", "fechado"] as const;

export interface Proposta {
  id: number;
  numero_proposta: string | null;
  numero_lead: string | null;
  data_envio: string;
  data_inicio_lead: string;
  empresa_id: number;
  empresa_nome: string;
  empresa_setor: string | null;
  servico: string | null;
  descricao: string | null;
  segmentos: Segmento[];
  valor: number | null;
  status_id: number;
  status_anterior_id: number | null;
  // Obrigatório só no formulário de Proposta (ProposalInput.termometro
  // continua não-nulo) — cards de Lead (Prospecção/Qualificação/Arquivado)
  // podem ficar sem nenhum. Como Lead e Proposta são a mesma linha (um Lead
  // promovido não duplica registro), o valor nulo pode aparecer aqui também.
  termometro: Termometro | null;
  tipo_servico: TipoServico | null;
  responsavel_id: string | null;
  resultado: Resultado | null;
  motivo_reprovacao: string | null;
  motivo_reprovacao_detalhe: string | null;
  gerado_de_lead: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContatoPrincipal {
  nome: string;
  telefone: string | null;
}

export interface ProximoCompromisso {
  titulo: string;
  inicio: string;
}

export interface EmpresaOption {
  id: number;
  nome: string;
}

export interface ProfileOption {
  id: string;
  full_name: string;
}

export interface ProposalHistoryEntry {
  id: number;
  proposta_id: number;
  autor_nome: string | null;
  texto: string;
  tipo: HistoricoTipo;
  created_at: string;
}

export interface ProposalInput {
  numero_proposta: string;
  data_envio: string;
  empresa_id: number;
  servico: string;
  descricao: string;
  segmentos: Segmento[];
  valor: number;
  status_id: number;
  termometro: Termometro;
  tipo_servico: TipoServico;
  responsavel_id: string | null;
  resultado: Resultado | null;
  motivo_reprovacao: string;
  motivo_reprovacao_detalhe: string;
}
