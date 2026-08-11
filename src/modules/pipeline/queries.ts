import { createClient } from "@/lib/supabase/server";
import type {
  ClienteOption,
  ContatoPrincipal,
  ProfileOption,
  ProposalHistoryEntry,
  ProposalStatus,
  Proposta,
  ProximoCompromisso,
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
      "id, numero_proposta, numero_lead, data_envio, cliente_id, servico, descricao, segmento, valor, status_id, termometro, tipo_servico, responsavel_id, resultado, created_at, updated_at, clientes(nome, setor)",
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((p) => ({
    id: p.id,
    numero_proposta: p.numero_proposta,
    numero_lead: p.numero_lead,
    data_envio: p.data_envio,
    cliente_id: p.cliente_id,
    cliente_nome: p.clientes?.nome ?? "—",
    cliente_setor: p.clientes?.setor ?? null,
    servico: p.servico,
    descricao: p.descricao,
    segmento: p.segmento as Proposta["segmento"],
    valor: p.valor == null ? null : Number(p.valor),
    status_id: p.status_id,
    termometro: p.termometro as Termometro,
    tipo_servico: p.tipo_servico as TipoServico | null,
    responsavel_id: p.responsavel_id,
    resultado: p.resultado as Proposta["resultado"],
    created_at: p.created_at,
    updated_at: p.updated_at,
  }));
}

// Primeiro contato cadastrado de cada cliente (mais antigo), usado como
// "contato do responsável" no card do Kanban — não há conceito de contato
// principal/preferencial no schema ainda, então usamos o mais antigo como
// aproximação razoável.
export async function getContatosPrincipais(): Promise<Map<number, ContatoPrincipal>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contatos_cliente")
    .select("cliente_id, nome, telefone, created_at")
    .order("created_at");

  if (error) throw error;

  const map = new Map<number, ContatoPrincipal>();
  for (const c of data ?? []) {
    if (!map.has(c.cliente_id)) map.set(c.cliente_id, { nome: c.nome, telefone: c.telefone });
  }
  return map;
}

// Próximo compromisso agendado (a partir de agora) de cada cliente, usado na
// tag do card do Kanban.
export async function getProximosCompromissos(): Promise<Map<number, ProximoCompromisso>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("compromissos")
    .select("cliente_id, titulo, inicio")
    .not("cliente_id", "is", null)
    .gte("inicio", new Date().toISOString())
    .order("inicio");

  if (error) throw error;

  const map = new Map<number, ProximoCompromisso>();
  for (const c of data ?? []) {
    if (c.cliente_id === null) continue;
    if (!map.has(c.cliente_id)) map.set(c.cliente_id, { titulo: c.titulo, inicio: c.inicio });
  }
  return map;
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
    .select("id, proposta_id, texto, tipo, created_at, autor:profiles(full_name)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((h) => ({
    id: h.id,
    proposta_id: h.proposta_id,
    autor_nome: h.autor?.full_name ?? null,
    texto: h.texto,
    tipo: h.tipo as ProposalHistoryEntry["tipo"],
    created_at: h.created_at,
  }));
}
