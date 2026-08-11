import { createClient } from "@/lib/supabase/server";
import type { Cliente, ClienteListItem, Contato, Interacao, PropostaResumo } from "./types";

export async function getClientes(): Promise<ClienteListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .select("id, nome, setor, endereco, observacoes, created_at, propostas(data_envio)")
    .order("nome");

  if (error) throw error;

  return (data ?? []).map((c) => ({
    id: c.id,
    nome: c.nome,
    setor: c.setor,
    endereco: c.endereco,
    observacoes: c.observacoes,
    created_at: c.created_at,
    ultima_proposta:
      c.propostas.length > 0
        ? c.propostas.reduce((max, p) => (p.data_envio > max ? p.data_envio : max), c.propostas[0].data_envio)
        : null,
  }));
}

export async function getClienteById(id: number): Promise<Cliente | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .select("id, nome, setor, endereco, observacoes, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getContatosByCliente(clienteId: number): Promise<Contato[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contatos_cliente")
    .select("id, cliente_id, nome, cargo, email, telefone, created_at")
    .eq("cliente_id", clienteId)
    .order("created_at");

  if (error) throw error;
  return data;
}

export async function getPropostasByCliente(clienteId: number): Promise<PropostaResumo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("propostas")
    .select(
      "id, numero_proposta, numero_lead, data_envio, valor, termometro, proposal_statuses(label)",
    )
    .eq("cliente_id", clienteId)
    .order("data_envio", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((p) => ({
    id: p.id,
    numero_proposta: p.numero_proposta,
    numero_lead: p.numero_lead,
    data_envio: p.data_envio,
    valor: p.valor == null ? null : Number(p.valor),
    termometro: p.termometro as PropostaResumo["termometro"],
    status_label: p.proposal_statuses?.label ?? "—",
  }));
}

export async function getInteracoesByCliente(clienteId: number): Promise<Interacao[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interacoes_cliente")
    .select("id, cliente_id, tipo, descricao, data_interacao, autor:profiles(full_name)")
    .eq("cliente_id", clienteId)
    .order("data_interacao", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((i) => ({
    id: i.id,
    cliente_id: i.cliente_id,
    tipo: i.tipo,
    descricao: i.descricao,
    data_interacao: i.data_interacao,
    autor_nome: i.autor?.full_name ?? null,
  }));
}
