import { createClient } from "@/lib/supabase/server";
import type { ClienteOption, Compromisso, CompromissoTipo } from "./types";

export async function getCompromissos(): Promise<Compromisso[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("compromissos")
    .select(
      "id, titulo, descricao, inicio, fim, tipo, cliente_id, clientes(nome), criado_por:profiles(full_name)",
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
    cliente_id: c.cliente_id,
    cliente_nome: c.clientes?.nome ?? null,
    criado_por_nome: c.criado_por?.full_name ?? null,
  }));
}

export async function getClienteOptions(): Promise<ClienteOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("clientes").select("id, nome").order("nome");

  if (error) throw error;
  return data;
}
