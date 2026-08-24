"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAtualizacoes } from "./queries";
import type { Atualizacao, AtualizacaoInput, AtualizacaoItemInput } from "./types";

async function requireAdmin(): Promise<{ error: string | null; userId: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada, faça login novamente.", userId: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { error: "Apenas administradores podem gerenciar atualizações.", userId: null };
  }

  return { error: null, userId: user.id };
}

export async function createAtualizacao(input: AtualizacaoInput) {
  const guard = await requireAdmin();
  if (guard.error) return { error: guard.error };

  const numeroPatch = input.numeroPatch.trim();
  if (!numeroPatch) return { error: "Informe o número do patch." };
  if (!input.dataHora) return { error: "Informe a data/hora da atualização." };

  const admin = createAdminClient();
  const { error } = await admin.from("atualizacoes").insert({
    numero_patch: numeroPatch,
    data_hora: new Date(input.dataHora).toISOString(),
    created_by: guard.userId,
  });

  if (error) return { error: error.message };

  revalidatePath("/atualizacoes");
  return { error: null };
}

// Marca (ou desmarca) uma atualização como "Versão Atual". Ao marcar, primeiro
// desmarca qualquer outra que já estivesse marcada e só depois marca a nova —
// nessa ordem, nunca existem duas marcadas ao mesmo tempo (reforçado por
// índice único parcial em atualizacoes_versao_atual_unica_idx).
export async function setVersaoAtual(atualizacaoId: number, marcar: boolean) {
  const guard = await requireAdmin();
  if (guard.error) return { error: guard.error };

  const admin = createAdminClient();

  if (marcar) {
    const { error: unsetError } = await admin
      .from("atualizacoes")
      .update({ versao_atual: false })
      .eq("versao_atual", true)
      .neq("id", atualizacaoId);
    if (unsetError) return { error: unsetError.message };
  }

  const { error } = await admin
    .from("atualizacoes")
    .update({ versao_atual: marcar })
    .eq("id", atualizacaoId);
  if (error) return { error: error.message };

  revalidatePath("/atualizacoes");
  return { error: null };
}

export async function createAtualizacaoItem(atualizacaoId: number, input: AtualizacaoItemInput) {
  const guard = await requireAdmin();
  if (guard.error) return { error: guard.error };

  const local = input.local.trim();
  const descricao = input.descricao.trim();
  if (!local) return { error: "Informe o local." };
  if (!descricao) return { error: "Informe a descrição." };

  const admin = createAdminClient();
  const { error } = await admin.from("atualizacoes_itens").insert({
    atualizacao_id: atualizacaoId,
    numero_chamado: input.numeroChamado.trim() || null,
    tipo: input.tipo,
    local,
    descricao,
  });

  if (error) return { error: error.message };

  revalidatePath("/atualizacoes");
  return { error: null };
}

export async function updateAtualizacaoItem(itemId: number, input: AtualizacaoItemInput) {
  const guard = await requireAdmin();
  if (guard.error) return { error: guard.error };

  const local = input.local.trim();
  const descricao = input.descricao.trim();
  if (!local) return { error: "Informe o local." };
  if (!descricao) return { error: "Informe a descrição." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("atualizacoes_itens")
    .update({
      numero_chamado: input.numeroChamado.trim() || null,
      tipo: input.tipo,
      local,
      descricao,
    })
    .eq("id", itemId);

  if (error) return { error: error.message };

  revalidatePath("/atualizacoes");
  return { error: null };
}

export async function deleteAtualizacaoItem(itemId: number) {
  const guard = await requireAdmin();
  if (guard.error) return { error: guard.error };

  const admin = createAdminClient();
  const { error } = await admin.from("atualizacoes_itens").delete().eq("id", itemId);

  if (error) return { error: error.message };

  revalidatePath("/atualizacoes");
  return { error: null };
}

export async function getHasUnseenAtualizacoes(): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_unseen_atualizacoes_ids");
  if (error || !data) return false;
  return data.length > 0;
}

export async function markAtualizacoesAsSeen(): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada, faça login novamente." };

  const { data: unseenIds, error: unseenError } = await supabase.rpc(
    "get_unseen_atualizacoes_ids",
  );
  if (unseenError) return { error: unseenError.message };
  if (!unseenIds || unseenIds.length === 0) return { error: null };

  const rows = unseenIds.map((atualizacaoId) => ({ atualizacao_id: atualizacaoId, user_id: user.id }));
  const { error } = await supabase
    .from("atualizacoes_vistas")
    .upsert(rows, { onConflict: "atualizacao_id,user_id", ignoreDuplicates: true });

  if (error) return { error: error.message };
  return { error: null };
}

export async function getAllAtualizacoes(): Promise<Atualizacao[]> {
  return getAtualizacoes();
}
