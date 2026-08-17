import type { Segmento, Termometro } from "@/modules/pipeline/types";

export type StatusKey = "prospeccao" | "qualificacao" | "proposta" | "negociacao" | "fechado";
export type Resultado = "aprovado" | "reprovado";
export type TipoServico = "fixo" | "spot";

export interface DashboardProposta {
  id: number;
  numero_proposta: string | null;
  numero_lead: string | null;
  empresa_nome: string;
  valor: number;
  data_envio: string;
  tipo_servico: TipoServico;
  servico: string | null;
  segmento: Segmento | null;
  termometro: Termometro;
  status_key: StatusKey;
  status_label: string;
  status_sort_order: number;
  resultado: Resultado | null;
}

export interface DashboardFilters {
  dataInicio: string;
  dataFim: string;
  tipoServico: TipoServico | "";
  segmento: Segmento | "";
  servico: string;
  termometro: Termometro | "";
}
