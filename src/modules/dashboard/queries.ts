import { createClient } from "@/lib/supabase/server";
import type { DashboardProposta, StatusKey, TipoServico } from "./types";

export async function getDashboardPropostas(): Promise<DashboardProposta[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("propostas")
    .select(
      "id, numero_proposta, valor, data_envio, tipo_servico, clientes(nome), proposal_statuses(key, label, sort_order)",
    )
    .order("data_envio");

  if (error) throw error;

  return (data ?? []).map((p) => ({
    id: p.id,
    numero_proposta: p.numero_proposta,
    cliente_nome: p.clientes?.nome ?? "—",
    valor: Number(p.valor),
    data_envio: p.data_envio,
    tipo_servico: p.tipo_servico as TipoServico,
    status_key: (p.proposal_statuses?.key ?? "em_analise") as StatusKey,
    status_label: p.proposal_statuses?.label ?? "—",
    status_sort_order: p.proposal_statuses?.sort_order ?? 0,
  }));
}
