"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ClienteInput, ContatoInput } from "./types";

function toRow(input: ClienteInput) {
  return {
    nome: input.nome.trim(),
    setor: input.setor.trim() || null,
    endereco: input.endereco.trim() || null,
    observacoes: input.observacoes.trim() || null,
  };
}

export async function createCliente(input: ClienteInput) {
  if (!input.nome.trim()) return { error: "Informe o nome do cliente." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("clientes")
    .insert({ ...toRow(input), created_by: user?.id ?? null })
    .select("id")
    .single();

  if (error) return { error: error.message, id: null };

  revalidatePath("/clientes");
  return { error: null, id: data.id };
}

export async function updateCliente(clienteId: number, input: ClienteInput) {
  if (!input.nome.trim()) return { error: "Informe o nome do cliente." };

  const supabase = await createClient();
  const { error } = await supabase.from("clientes").update(toRow(input)).eq("id", clienteId);

  if (error) return { error: error.message };

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${clienteId}`);
  return { error: null };
}

export async function deleteCliente(clienteId: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("clientes").delete().eq("id", clienteId);

  if (error) return { error: error.message };

  revalidatePath("/clientes");
  return { error: null };
}

export async function addContato(clienteId: number, input: ContatoInput) {
  if (!input.nome.trim()) return { error: "Informe o nome do contato." };

  const supabase = await createClient();
  const { error } = await supabase.from("contatos_cliente").insert({
    cliente_id: clienteId,
    nome: input.nome.trim(),
    cargo: input.cargo.trim() || null,
    email: input.email.trim() || null,
    telefone: input.telefone.trim() || null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/clientes/${clienteId}`);
  return { error: null };
}
