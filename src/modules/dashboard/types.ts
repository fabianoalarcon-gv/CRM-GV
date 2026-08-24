import type { Segmento, Termometro } from "@/modules/pipeline/types";

export type StatusKey = "prospeccao" | "qualificacao" | "proposta" | "negociacao" | "fechado";
export type Resultado = "aprovado" | "reprovado";
export type TipoServico = "fixo" | "spot";

export interface DashboardProposta {
  id: number;
  numero_proposta: string | null;
  numero_lead: string | null;
  empresa_id: number;
  empresa_nome: string;
  origem_lead: string | null;
  valor: number;
  data_envio: string;
  data_inicio_lead: string;
  tipo_servico: TipoServico;
  servico: string | null;
  segmento: Segmento | null;
  termometro: Termometro | null;
  status_key: StatusKey;
  status_label: string;
  status_sort_order: number;
  resultado: Resultado | null;
}

export interface DashboardAcao {
  proposta_id: number;
  tipo: string;
  inicio: string;
}

export interface DashboardStatusHistoricoEntry {
  proposta_id: number;
  status_key: StatusKey;
  entrou_em: string;
}

export interface DashboardEmpresaCadastro {
  id: number;
  created_at: string;
}

export interface DashboardFilters {
  dataInicio: string;
  dataFim: string;
  tipoServico: TipoServico | "";
  segmento: Segmento | "";
  servico: string;
  termometro: Termometro | "";
}
