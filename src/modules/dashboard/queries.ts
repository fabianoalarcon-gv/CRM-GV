import { createClient } from "@/lib/supabase/server";
import type { Segmento, Termometro } from "@/modules/pipeline/types";
import type { DashboardProposta, Resultado, StatusKey, TipoServico } from "./types";

export async function getDashboardPropostas(): Promise<DashboardProposta[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("propostas")
    .select(
      "id, numero_proposta, numero_lead, valor, data_envio, tipo_servico, servico, segmento, termometro, resultado, empresas(nome), proposal_statuses!status_id(key, label, sort_order)",
    )
    .order("data_envio");

  if (error) throw error;

  return (data ?? []).map((p) => ({
    id: p.id,
    numero_proposta: p.numero_proposta,
    numero_lead: p.numero_lead,
    empresa_nome: p.empresas?.nome ?? "—",
    // Lead sem valor estimado conta como R$0 nos totais/gráficos — não dá
    // pra somar um valor que ainda não existe.
    valor: p.valor == null ? 0 : Number(p.valor),
    data_envio: p.data_envio,
    tipo_servico: p.tipo_servico as TipoServico,
    servico: p.servico,
    segmento: p.segmento as Segmento | null,
    termometro: p.termometro as Termometro,
    status_key: (p.proposal_statuses?.key ?? "prospeccao") as StatusKey,
    status_label: p.proposal_statuses?.label ?? "—",
    status_sort_order: p.proposal_statuses?.sort_order ?? 0,
    resultado: p.resultado as Resultado | null,
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
