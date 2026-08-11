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
export const LEADS_STATUS_KEYS = ["prospeccao", "qualificacao"] as const;
export const PIPELINE_STATUS_KEYS = ["proposta", "negociacao", "fechado"] as const;

export interface Proposta {
  id: number;
  numero_proposta: string | null;
  numero_lead: string | null;
  data_envio: string;
  cliente_id: number;
  cliente_nome: string;
  cliente_setor: string | null;
  servico: string | null;
  descricao: string | null;
  segmento: Segmento | null;
  valor: number | null;
  status_id: number;
  termometro: Termometro;
  tipo_servico: TipoServico | null;
  responsavel_id: string | null;
  resultado: Resultado | null;
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

export interface ClienteOption {
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
  cliente_id: number;
  servico: string;
  descricao: string;
  valor: number;
  status_id: number;
  termometro: Termometro;
  tipo_servico: TipoServico;
  responsavel_id: string | null;
  resultado: Resultado | null;
}
