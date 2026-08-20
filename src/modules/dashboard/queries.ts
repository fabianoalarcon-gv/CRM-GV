import { createClient } from "@/lib/supabase/server";
import type { Segmento, Termometro } from "@/modules/pipeline/types";
import type {
  DashboardAcao,
  DashboardProposta,
  DashboardStatusHistoricoEntry,
  Resultado,
  StatusKey,
  TipoServico,
} from "./types";

export async function getDashboardPropostas(): Promise<DashboardProposta[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("propostas")
    .select(
      "id, numero_proposta, numero_lead, empresa_id, valor, data_envio, data_inicio_lead, tipo_servico, servico, segmento, termometro, resultado, empresas(nome, origem_lead), proposal_statuses!status_id(key, label, sort_order)",
    )
    .order("data_envio");

  if (error) throw error;

  return (data ?? []).map((p) => ({
    id: p.id,
    numero_proposta: p.numero_proposta,
    numero_lead: p.numero_lead,
    empresa_id: p.empresa_id,
    empresa_nome: p.empresas?.nome ?? "—",
    origem_lead: p.empresas?.origem_lead ?? null,
    // Lead sem valor estimado conta como R$0 nos totais/gráficos — não dá
    // pra somar um valor que ainda não existe.
    valor: p.valor == null ? 0 : Number(p.valor),
    data_envio: p.data_envio,
    data_inicio_lead: p.data_inicio_lead,
    tipo_servico: p.tipo_servico as TipoServico,
    servico: p.servico,
    segmento: p.segmento as Segmento | null,
    termometro: p.termometro as Termometro | null,
    status_key: (p.proposal_statuses?.key ?? "prospeccao") as StatusKey,
    status_label: p.proposal_statuses?.label ?? "—",
    status_sort_order: p.proposal_statuses?.sort_order ?? 0,
    resultado: p.resultado as Resultado | null,
  }));
}

// Ações (compromissos) de Leads/Propostas — alimenta o indicador de tempo
// médio entre ações da mesma categoria. Ações sem tipo (registros muito
// antigos, de antes da coluna existir) não entram: sem categoria não dá pra
// agrupar.
export async function getDashboardAcoes(): Promise<DashboardAcao[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("compromissos")
    .select("proposta_id, tipo, inicio")
    .not("proposta_id", "is", null)
    .not("tipo", "is", null)
    .order("inicio");

  if (error) throw error;

  return (data ?? [])
    .filter((c) => c.proposta_id != null && c.tipo != null)
    .map((c) => ({
      proposta_id: c.proposta_id as number,
      tipo: c.tipo as string,
      inicio: c.inicio,
    }));
}

// Histórico automático de mudança de estágio (trigger em propostas_status_historico)
// — alimenta o indicador de tempo de permanência por etapa.
export async function getDashboardStatusHistorico(): Promise<DashboardStatusHistoricoEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("propostas_status_historico")
    .select("proposta_id, entrou_em, proposal_statuses(key)")
    .order("proposta_id")
    .order("entrou_em");

  if (error) throw error;

  return (data ?? []).map((h) => ({
    proposta_id: h.proposta_id,
    entrou_em: h.entrou_em,
    status_key: (h.proposal_statuses?.key ?? "prospeccao") as StatusKey,
  }));
}

// Rótulos direto da tabela — não dá pra confiar só nas propostas existentes
// pra descobrir o rótulo de cada status: um estágio sem nenhuma proposta ainda
// (ex: um estágio novo do funil) nunca apareceria no label map se ele viesse
// só das propostas.
export async function getStatusLabels(): Promise<Partial<Record<StatusKey, string>>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("proposal_statuses").select("key, label");

  if (error) throw error;

  const map: Partial<Record<StatusKey, string>> = {};
  for (const s of data ?? []) map[s.key as StatusKey] = s.label;
  return map;
}
