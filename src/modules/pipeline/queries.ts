import { createClient } from "@/lib/supabase/server";
import type {
  EmpresaOption,
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
      "id, numero_proposta, numero_lead, data_envio, data_inicio_lead, empresa_id, servico, descricao, segmentos, valor, status_id, status_anterior_id, termometro, tipo_servico, responsavel_id, resultado, motivo_reprovacao, motivo_reprovacao_detalhe, gerado_de_lead, created_at, updated_at, empresas(nome, setor)",
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((p) => ({
    id: p.id,
    numero_proposta: p.numero_proposta,
    numero_lead: p.numero_lead,
    data_envio: p.data_envio,
    data_inicio_lead: p.data_inicio_lead,
    empresa_id: p.empresa_id,
    empresa_nome: p.empresas?.nome ?? "—",
    empresa_setor: p.empresas?.setor ?? null,
    servico: p.servico,
    descricao: p.descricao,
    segmentos: (p.segmentos ?? []) as Proposta["segmentos"],
    valor: p.valor == null ? null : Number(p.valor),
    status_id: p.status_id,
    status_anterior_id: p.status_anterior_id,
    termometro: p.termometro as Termometro | null,
    tipo_servico: p.tipo_servico as TipoServico | null,
    responsavel_id: p.responsavel_id,
    resultado: p.resultado as Proposta["resultado"],
    motivo_reprovacao: p.motivo_reprovacao,
    motivo_reprovacao_detalhe: p.motivo_reprovacao_detalhe,
    gerado_de_lead: p.gerado_de_lead,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }));
}

// Primeiro contato cadastrado de cada empresa (mais antigo), usado como
// "contato do responsável" no card do Kanban — não há conceito de contato
// principal/preferencial no schema ainda, então usamos o mais antigo como
// aproximação razoável.
export async function getContatosPrincipais(): Promise<Map<number, ContatoPrincipal>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contatos_empresa")
    .select("empresa_id, nome, telefone, created_at")
    .order("created_at");

  if (error) throw error;

  const map = new Map<number, ContatoPrincipal>();
  for (const c of data ?? []) {
    if (!map.has(c.empresa_id)) map.set(c.empresa_id, { nome: c.nome, telefone: c.telefone });
  }
  return map;
}

// Próximo compromisso agendado (a partir de agora) de cada Lead/Proposta,
// usado na tag do card do Kanban. Chaveado por proposta_id (não empresa_id)
// pra não vazar a Ação de um card pros outros cards da mesma empresa.
export async function getProximosCompromissos(): Promise<Map<number, ProximoCompromisso>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("compromissos")
    .select("proposta_id, titulo, inicio")
    .not("proposta_id", "is", null)
    .gte("inicio", new Date().toISOString())
    .order("inicio");

  if (error) throw error;

  const map = new Map<number, ProximoCompromisso>();
  for (const c of data ?? []) {
    if (c.proposta_id === null) continue;
    if (!map.has(c.proposta_id)) map.set(c.proposta_id, { titulo: c.titulo, inicio: c.inicio });
  }
  return map;
}

export async function getEmpresasOptions(): Promise<EmpresaOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("empresas").select("id, nome").order("nome");

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
