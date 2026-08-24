import { last90DaysRange } from "@/lib/date";
import type { Proposta, Segmento, Termometro } from "./types";

export interface PropostaFilters {
  dataInicio: string;
  dataFim: string;
  termometro: Termometro | "";
  segmento: Segmento | "";
}

export const EMPTY_PROPOSTA_FILTERS: PropostaFilters = {
  dataInicio: "",
  dataFim: "",
  termometro: "",
  segmento: "",
};

// Período padrão ao abrir Leads/Pipeline: últimos 90 dias (mesmo critério do
// Dashboard) em vez do histórico inteiro. Compartilhado pelas duas telas, que
// já reaproveitam o mesmo PropostaFilters/applyPropostaFilters.
export function defaultPropostaFilters(): PropostaFilters {
  return { termometro: "", segmento: "", ...last90DaysRange() };
}

export function applyPropostaFilters(propostas: Proposta[], filters: PropostaFilters): Proposta[] {
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
