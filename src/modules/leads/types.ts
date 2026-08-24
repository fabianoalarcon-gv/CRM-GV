import type { Segmento, Termometro } from "@/modules/pipeline/types";
import type { CompromissoTipo } from "@/modules/calendario/types";

export interface LeadInput {
  empresa_id: number;
  data_inicio_lead: string;
  termometro: Termometro | null;
  descricao: string;
  segmentos: Segmento[];
  valor_estimado: number | null;
  status_id: number;
  responsavel_id: string | null;
}

export type Repeticao = "nao_repete" | "diaria" | "semanal" | "mensal" | "anual" | "dias_uteis";

export interface AcaoInput {
  titulo: string;
  inicio: string;
  fim: string;
  tipo: CompromissoTipo;
  descricao: string;
  repeticao: Repeticao;
  quantidadeRepeticoes: number;
}
