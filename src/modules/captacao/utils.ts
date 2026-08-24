import { last90DaysRange } from "@/lib/date";
import type { Captacao } from "./types";

export interface CaptacaoFilters {
  busca: string;
  dataInicio: string;
  dataFim: string;
  origem: string;
  contato: "" | "sim" | "nao";
}

export const EMPTY_CAPTACAO_FILTERS: CaptacaoFilters = {
  busca: "",
  dataInicio: "",
  dataFim: "",
  origem: "",
  contato: "",
};

// Período padrão ao abrir a página de Captação: últimos 90 dias (mesmo
// critério do Dashboard) em vez do histórico inteiro.
export function defaultCaptacaoFilters(): CaptacaoFilters {
  return { busca: "", origem: "", contato: "", ...last90DaysRange() };
}

export function applyCaptacaoFilters(captacoes: Captacao[], filters: CaptacaoFilters): Captacao[] {
  const query = filters.busca.trim().toLowerCase();
  // created_at é timestamptz — compara por limites do dia local (mesmo
  // padrão de applyPropostaFilters em pipeline/utils.ts), não por prefixo.
  const start = filters.dataInicio ? new Date(`${filters.dataInicio}T00:00:00`) : null;
  const end = filters.dataFim ? new Date(`${filters.dataFim}T23:59:59.999`) : null;

  return captacoes.filter((c) => {
    if (query && !c.empresaNome.toLowerCase().includes(query)) return false;

    const createdAt = new Date(c.createdAt);
    if (start && createdAt < start) return false;
    if (end && createdAt > end) return false;

    if (filters.origem && c.origemLead !== filters.origem) return false;
    if (filters.contato === "sim" && !c.temContato) return false;
    if (filters.contato === "nao" && c.temContato) return false;

    return true;
  });
}
