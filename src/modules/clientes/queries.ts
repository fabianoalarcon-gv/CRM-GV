import { createClient } from "@/lib/supabase/server";
import type { Cliente } from "./types";

export async function getClientes(): Promise<Cliente[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .select("id, nome, setor, endereco, observacoes, created_at")
    .order("nome");

  if (error) throw error;
  return data;
}
