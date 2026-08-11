import type { Segmento, Termometro } from "@/modules/pipeline/types";
import type { CompromissoTipo } from "@/modules/calendario/types";

export interface LeadInput {
  cliente_id: number;
  termometro: Termometro;
  descricao: string;
  segmento: Segmento | null;
  valor_estimado: number | null;
  status_id: number;
}

export interface AcaoInput {
  titulo: string;
  inicio: string;
  fim: string;
  tipo: CompromissoTipo;
  descricao: string;
}
