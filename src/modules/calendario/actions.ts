"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CompromissoInput } from "./types";

function toRow(input: CompromissoInput) {
  return {
    titulo: input.titulo.trim(),
    descricao: input.descricao.trim() || null,
    inicio: new Date(input.inicio).toISOString(),
    fim: input.fim ? new Date(input.fim).toISOString() : null,
    tipo: input.tipo,
    cliente_id: input.cliente_id,
  };
}

export async function createCompromisso(input: CompromissoInput) {
  if (!input.titulo.trim()) return { error: "Informe o título do compromisso." };
  if (!input.inicio) return { error: "Informe a data/hora de início." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada, faça login novamente." };

  const { error } = await supabase
    .from("compromissos")
    .insert({ ...toRow(input), criado_por: user.id });

  if (error) return { error: error.message };

  revalidatePath("/calendario");
  return { error: null };
}

export async function updateCompromisso(compromissoId: number, input: CompromissoInput) {
  if (!input.titulo.trim()) return { error: "Informe o título do compromisso." };
  if (!input.inicio) return { error: "Informe a data/hora de início." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("compromissos")
    .update(toRow(input))
    .eq("id", compromissoId);

  if (error) return { error: error.message };

  revalidatePath("/calendario");
  return { error: null };
}

export async function deleteCompromisso(compromissoId: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("compromissos").delete().eq("id", compromissoId);

  if (error) return { error: error.message };

  revalidatePath("/calendario");
  return { error: null };
}
