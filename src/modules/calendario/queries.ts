import { createClient } from "@/lib/supabase/server";
import type { EmpresaOption, Compromisso, CompromissoTipo } from "./types";

export async function getCompromissos(): Promise<Compromisso[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("compromissos")
    .select(
      "id, titulo, descricao, inicio, fim, tipo, empresa_id, proposta_id, created_at, empresas(nome), criado_por:profiles(full_name)",
    )
    .order("inicio");

  if (error) throw error;

  return (data ?? []).map((c) => ({
    id: c.id,
    titulo: c.titulo,
    descricao: c.descricao,
    inicio: c.inicio,
    fim: c.fim,
    tipo: c.tipo as CompromissoTipo | null,
    empresa_id: c.empresa_id,
    empresa_nome: c.empresas?.nome ?? null,
    criado_por_nome: c.criado_por?.full_name ?? null,
    proposta_id: c.proposta_id,
    created_at: c.created_at,
  }));
}

export async function getEmpresaOptions(): Promise<EmpresaOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("empresas").select("id, nome").order("nome");

  if (error) throw error;
  return data;
}
