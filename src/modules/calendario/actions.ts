"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  syncCompromissoCreated,
  syncCompromissoDeleted,
  syncCompromissoUpdated,
} from "./google-sync";
import type { CompromissoInput } from "./types";
import { parseBrasiliaDateTime } from "./utils";

function toRow(input: CompromissoInput) {
  return {
    titulo: input.titulo.trim(),
    descricao: input.descricao.trim() || null,
    inicio: parseBrasiliaDateTime(input.inicio).toISOString(),
    fim: input.fim ? parseBrasiliaDateTime(input.fim).toISOString() : null,
    tipo: input.tipo,
    empresa_id: input.empresa_id,
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

  const row = toRow(input);
  const { data: inserted, error } = await supabase
    .from("compromissos")
    .insert({ ...row, criado_por: user.id })
    .select("id, created_at")
    .single();

  if (error) return { error: error.message };

  // Compromisso criado pelo formulário avulso do Calendário — nunca tem um
  // Lead/Proposta vinculado (só quem entra por um card, via leads/actions.ts).
  await syncCompromissoCreated(supabase, inserted.id, {
    ...row,
    proposta_id: null,
    criado_por: user.id,
    created_at: inserted.created_at,
  });

  revalidatePath("/calendario");
  return { error: null };
}

export async function updateCompromisso(compromissoId: number, input: CompromissoInput) {
  if (!input.titulo.trim()) return { error: "Informe o título do compromisso." };
  if (!input.inicio) return { error: "Informe a data/hora de início." };

  const supabase = await createClient();
  const row = toRow(input);
  const { data: updated, error } = await supabase
    .from("compromissos")
    .update(row)
    .eq("id", compromissoId)
    .select("proposta_id, criado_por, created_at")
    .single();

  if (error) return { error: error.message };

  // proposta_id/criado_por/created_at não são editáveis por este formulário,
  // mas preservam o que a Ação já tinha (rótulo do card e autor/data
  // originais, não os de quem editou agora).
  await syncCompromissoUpdated(supabase, compromissoId, {
    ...row,
    proposta_id: updated.proposta_id,
    criado_por: updated.criado_por,
    created_at: updated.created_at,
  });

  revalidatePath("/calendario");
  return { error: null };
}

export async function deleteCompromisso(compromissoId: number) {
  const supabase = await createClient();

  await syncCompromissoDeleted(supabase, compromissoId);

  const { error } = await supabase.from("compromissos").delete().eq("id", compromissoId);
  if (error) return { error: error.message };

  revalidatePath("/calendario");
  return { error: null };
}
