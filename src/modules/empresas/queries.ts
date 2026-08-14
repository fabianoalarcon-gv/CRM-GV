import { createClient } from "@/lib/supabase/server";
import type { Empresa, EmpresaListItem, Contato, Interacao, PropostaResumo } from "./types";

export async function getEmpresas(): Promise<EmpresaListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("empresas")
    .select(
      "id, nome, cnpj, setor, endereco, numero, cidade, uf, cep, observacoes, created_at, propostas(data_envio)",
    )
    .order("nome");

  if (error) throw error;

  return (data ?? []).map((c) => ({
    id: c.id,
    nome: c.nome,
    cnpj: c.cnpj,
    setor: c.setor,
    endereco: c.endereco,
    numero: c.numero,
    cidade: c.cidade,
    uf: c.uf,
    cep: c.cep,
    observacoes: c.observacoes,
    created_at: c.created_at,
    ultima_proposta:
      c.propostas.length > 0
        ? c.propostas.reduce((max, p) => (p.data_envio > max ? p.data_envio : max), c.propostas[0].data_envio)
        : null,
  }));
}

export async function getEmpresaById(id: number): Promise<Empresa | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("empresas")
    .select("id, nome, cnpj, setor, endereco, numero, cidade, uf, cep, observacoes, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getContatosByEmpresa(empresaId: number): Promise<Contato[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contatos_empresa")
    .select("id, empresa_id, nome, cargo, email, telefone, created_at")
    .eq("empresa_id", empresaId)
    .order("created_at");

  if (error) throw error;
  return data;
}

export async function getPropostasByEmpresa(empresaId: number): Promise<PropostaResumo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("propostas")
    .select(
      "id, numero_proposta, numero_lead, data_envio, valor, termometro, proposal_statuses!status_id(label)",
    )
    .eq("empresa_id", empresaId)
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

export async function getInteracoesByEmpresa(empresaId: number): Promise<Interacao[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interacoes_empresa")
    .select("id, empresa_id, tipo, descricao, data_interacao, autor:profiles(full_name)")
    .eq("empresa_id", empresaId)
    .order("data_interacao", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((i) => ({
    id: i.id,
    empresa_id: i.empresa_id,
    tipo: i.tipo,
    descricao: i.descricao,
    data_interacao: i.data_interacao,
    autor_nome: i.autor?.full_name ?? null,
  }));
}
