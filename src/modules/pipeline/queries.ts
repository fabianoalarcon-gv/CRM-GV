import { createClient } from "@/lib/supabase/server";
import type { ProposalStatus, Proposta, Termometro, TipoServico } from "./types";

export async function getProposalStatuses(): Promise<ProposalStatus[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposal_statuses")
    .select("id, key, label, color, sort_order, is_default")
    .order("sort_order");

  if (error) throw error;
  return data;
}

export async function getPropostas(): Promise<Proposta[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("propostas")
    .select(
      "id, numero_proposta, data_envio, cliente_id, servico, descricao, valor, status_id, termometro, tipo_servico, responsavel_id, created_at, updated_at, clientes(nome)",
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((p) => ({
    id: p.id,
    numero_proposta: p.numero_proposta,
    data_envio: p.data_envio,
    cliente_id: p.cliente_id,
    cliente_nome: p.clientes?.nome ?? "—",
    servico: p.servico,
    descricao: p.descricao,
    valor: Number(p.valor),
    status_id: p.status_id,
    termometro: p.termometro as Termometro,
    tipo_servico: p.tipo_servico as TipoServico,
    responsavel_id: p.responsavel_id,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }));
}
