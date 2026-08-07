export type Termometro = "frio" | "morno" | "quente";
export type TipoServico = "fixo" | "spot";

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
  servico: string | null;
  descricao: string | null;
  valor: number;
  status_id: number;
  termometro: Termometro;
  tipo_servico: TipoServico;
  responsavel_id: string | null;
  created_at: string;
  updated_at: string;
}
