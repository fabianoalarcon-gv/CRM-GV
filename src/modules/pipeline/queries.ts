import { createClient } from "@/lib/supabase/server";
import type {
  ClienteOption,
  ProfileOption,
  ProposalHistoryEntry,
  ProposalStatus,
  Proposta,
  Termometro,
  TipoServico,
} from "./types";

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

export async function getClientesOptions(): Promise<ClienteOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("clientes").select("id, nome").order("nome");

  if (error) throw error;
  return data;
}

export async function getProfileOptions(): Promise<ProfileOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .order("full_name");

  if (error) throw error;
  return data;
}

export async function getProposalHistory(): Promise<ProposalHistoryEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("propostas_historico")
    .select("id, proposta_id, texto, created_at, autor:profiles(full_name)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((h) => ({
    id: h.id,
    proposta_id: h.proposta_id,
    autor_nome: h.autor?.full_name ?? null,
    texto: h.texto,
    created_at: h.created_at,
  }));
}
