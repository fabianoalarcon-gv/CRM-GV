import { createClient } from "@/lib/supabase/server";
import type { CompromissoTipo } from "@/modules/calendario/types";
import type { Segmento } from "@/modules/pipeline/types";
import type { AcaoResumo, Empresa, EmpresaListItem, Contato, PropostaResumo } from "./types";

export async function getEmpresas(): Promise<EmpresaListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("empresas")
    .select(
      "id, nome, cnpj, setor, endereco, numero, cidade, uf, cep, origem_lead, site, observacoes, created_at, criador:profiles!created_by(email), propostas(data_envio, segmentos)",
    )
    .order("nome");

  if (error) throw error;

  return (data ?? []).map((c) => {
    const ultimaProposta =
      c.propostas.length > 0
        ? c.propostas.reduce((max, p) => (p.data_envio > max.data_envio ? p : max), c.propostas[0])
        : null;

    return {
      id: c.id,
      nome: c.nome,
      cnpj: c.cnpj,
      setor: c.setor,
      endereco: c.endereco,
      numero: c.numero,
      cidade: c.cidade,
      uf: c.uf,
      cep: c.cep,
      origem_lead: c.origem_lead,
      site: c.site,
      observacoes: c.observacoes,
      created_at: c.created_at,
      criador_email: c.criador?.email ?? null,
      ultima_proposta: ultimaProposta?.data_envio ?? null,
      segmento_recente: (ultimaProposta?.segmentos as Segmento[] | undefined) ?? [],
    };
  });
}

export async function getEmpresaById(id: number): Promise<Empresa | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("empresas")
    .select(
      "id, nome, cnpj, setor, endereco, numero, cidade, uf, cep, origem_lead, site, observacoes, created_at, criador:profiles!created_by(email)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    nome: data.nome,
    cnpj: data.cnpj,
    setor: data.setor,
    endereco: data.endereco,
    numero: data.numero,
    cidade: data.cidade,
    uf: data.uf,
    cep: data.cep,
    origem_lead: data.origem_lead,
    site: data.site,
    observacoes: data.observacoes,
    created_at: data.created_at,
    criador_email: data.criador?.email ?? null,
  };
}

export async function getContatosByEmpresa(empresaId: number): Promise<Contato[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contatos_empresa")
    .select("id, empresa_id, nome, cargo, email, telefone, telefone_tipo, principal, created_at")
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
      "id, numero_proposta, numero_lead, segmentos, valor, termometro, created_at, updated_at, proposal_statuses!status_id(label)",
    )
    .eq("empresa_id", empresaId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((p) => ({
    id: p.id,
    numero_proposta: p.numero_proposta,
    numero_lead: p.numero_lead,
    segmentos: (p.segmentos ?? []) as Segmento[],
    valor: p.valor == null ? null : Number(p.valor),
    termometro: p.termometro as PropostaResumo["termometro"],
    status_label: p.proposal_statuses?.label ?? "—",
    created_at: p.created_at,
    updated_at: p.updated_at,
  }));
}

export async function getAcoesByEmpresa(empresaId: number): Promise<AcaoResumo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("compromissos")
    .select(
      "id, titulo, descricao, inicio, fim, tipo, criado_por:profiles(email), proposta:propostas(numero_proposta, numero_lead)",
    )
    .eq("empresa_id", empresaId)
    .order("inicio", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((c) => ({
    id: c.id,
    titulo: c.titulo,
    descricao: c.descricao,
    inicio: c.inicio,
    fim: c.fim,
    tipo: c.tipo as CompromissoTipo | null,
    criador_email: c.criado_por?.email ?? null,
    numero_lead_proposta: c.proposta ? (c.proposta.numero_proposta ?? c.proposta.numero_lead) : null,
  }));
}
