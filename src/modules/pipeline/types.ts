export type Termometro = "frio" | "morno" | "quente";
export type TipoServico = "fixo" | "spot";
export type Resultado = "aprovado" | "reprovado";

export interface ProposalStatus {
  id: number;
  key: string;
  label: string;
  color: string | null;
  sort_order: number;
  is_default: boolean;
}

export interface Proposta {
  id: number;
  numero_proposta: string;
  data_envio: string;
  cliente_id: number;
  cliente_nome: string;
  cliente_setor: string | null;
  servico: string | null;
  descricao: string | null;
  valor: number;
  status_id: number;
  termometro: Termometro;
  tipo_servico: TipoServico;
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
