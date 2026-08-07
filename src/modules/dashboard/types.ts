export type StatusKey = "em_analise" | "aprovado" | "reprovado";
export type TipoServico = "fixo" | "spot";

export interface DashboardProposta {
  id: number;
  numero_proposta: string;
  cliente_nome: string;
  valor: number;
  data_envio: string;
  tipo_servico: TipoServico;
  status_key: StatusKey;
  status_label: string;
  status_sort_order: number;
}

export interface DashboardFilters {
  dataInicio: string;
  dataFim: string;
  tipoServico: TipoServico | "";
}
