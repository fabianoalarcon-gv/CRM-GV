import { createClient } from "@/lib/supabase/server";
import type { Cliente, Contato } from "./types";

export async function getClientes(): Promise<Cliente[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .select("id, nome, setor, endereco, observacoes, created_at")
    .order("nome");

  if (error) throw error;
  return data;
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
