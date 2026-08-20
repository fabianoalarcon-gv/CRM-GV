import { createClient } from "@/lib/supabase/server";
import type { Captacao } from "./types";

export async function getCaptacoes(): Promise<Captacao[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("captacoes")
    .select("id, empresa_id, created_at, empresas(nome, setor, cidade, uf, origem_lead)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const empresaIds = data.map((c) => c.empresa_id);
  const { data: contatos, error: contatosError } = await supabase
    .from("contatos_empresa")
    .select("empresa_id")
    .in("empresa_id", empresaIds);

  if (contatosError) throw contatosError;

  const empresasComContato = new Set((contatos ?? []).map((c) => c.empresa_id));

  return data.map((c) => ({
    id: c.id,
    empresaId: c.empresa_id,
    empresaNome: c.empresas?.nome ?? "—",
    setor: c.empresas?.setor ?? null,
    cidade: c.empresas?.cidade ?? null,
    uf: c.empresas?.uf ?? null,
    origemLead: c.empresas?.origem_lead ?? null,
    temContato: empresasComContato.has(c.empresa_id),
    createdAt: c.created_at,
  }));
}
