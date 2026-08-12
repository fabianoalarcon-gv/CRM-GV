import type { Proposta, Segmento, Termometro } from "@/modules/pipeline/types";

export interface LeadFilters {
  dataInicio: string;
  dataFim: string;
  termometro: Termometro | "";
  segmento: Segmento | "";
}

export const EMPTY_LEAD_FILTERS: LeadFilters = {
  dataInicio: "",
  dataFim: "",
  termometro: "",
  segmento: "",
};

export function applyLeadFilters(propostas: Proposta[], filters: LeadFilters): Proposta[] {
  // created_at é timestamptz — compara por limites do dia local (mesmo padrão
  // de isBeforeToday em calendario/utils.ts), não por prefixo de string.
  const start = filters.dataInicio ? new Date(`${filters.dataInicio}T00:00:00`) : null;
  const end = filters.dataFim ? new Date(`${filters.dataFim}T23:59:59.999`) : null;

  return propostas.filter((p) => {
    const createdAt = new Date(p.created_at);
    if (start && createdAt < start) return false;
    if (end && createdAt > end) return false;
    if (filters.termometro && p.termometro !== filters.termometro) return false;
    if (filters.segmento && p.segmento !== filters.segmento) return false;
    return true;
  });
}
