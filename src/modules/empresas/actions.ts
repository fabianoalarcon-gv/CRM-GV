"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EmpresaInput, ContatoInput, InteracaoInput } from "./types";

function toRow(input: EmpresaInput) {
  return {
    nome: input.nome.trim(),
    setor: input.setor.trim() || null,
    endereco: input.endereco.trim() || null,
    observacoes: input.observacoes.trim() || null,
  };
}

export async function createEmpresa(input: EmpresaInput) {
  if (!input.nome.trim()) return { error: "Informe o nome da empresa." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("empresas")
    .insert({ ...toRow(input), created_by: user?.id ?? null })
    .select("id")
    .single();

  if (error) return { error: error.message, id: null };

  revalidatePath("/empresas");
  return { error: null, id: data.id };
}

export async function updateEmpresa(empresaId: number, input: EmpresaInput) {
  if (!input.nome.trim()) return { error: "Informe o nome da empresa." };

  const supabase = await createClient();
  const { error } = await supabase.from("empresas").update(toRow(input)).eq("id", empresaId);

  if (error) return { error: error.message };

  revalidatePath("/empresas");
  revalidatePath(`/empresas/${empresaId}`);
  return { error: null };
}

export async function deleteEmpresa(empresaId: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("empresas").delete().eq("id", empresaId);

  if (error) return { error: error.message };

  revalidatePath("/empresas");
  return { error: null };
}

export async function addContato(empresaId: number, input: ContatoInput) {
  if (!input.nome.trim()) return { error: "Informe o nome do contato." };

  const supabase = await createClient();
  const { error } = await supabase.from("contatos_empresa").insert({
    empresa_id: empresaId,
    nome: input.nome.trim(),
    cargo: input.cargo.trim() || null,
    email: input.email.trim() || null,
    telefone: input.telefone.trim() || null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/empresas/${empresaId}`);
  return { error: null };
}

export async function addInteracao(empresaId: number, input: InteracaoInput) {
  if (!input.descricao.trim()) return { error: "Descreva a interação." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("interacoes_empresa").insert({
    empresa_id: empresaId,
    autor_id: user?.id ?? null,
    tipo: input.tipo || null,
    descricao: input.descricao.trim(),
  });

  if (error) return { error: error.message };

  revalidatePath(`/empresas/${empresaId}`);
  return { error: null };
}
