import { createClient } from "@/lib/supabase/server";
import type { Atualizacao, AtualizacaoItem } from "./types";

// Usado pelo modal "Sobre o App" no header — só o número do patch marcado
// como Versão Atual, sem precisar buscar a lista inteira com itens.
export async function getVersaoAtualPatch(): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("atualizacoes")
    .select("numero_patch")
    .eq("versao_atual", true)
    .maybeSingle();

  if (error) throw error;
  return data?.numero_patch ?? null;
}

export async function getAtualizacoes(): Promise<Atualizacao[]> {
  const supabase = await createClient();

  const { data: atualizacoes, error } = await supabase
    .from("atualizacoes")
    .select("id, numero_patch, data_hora, created_at, versao_atual")
    .order("data_hora", { ascending: false });

  if (error) throw error;
  if (!atualizacoes || atualizacoes.length === 0) return [];

  const { data: itens, error: itensError } = await supabase
    .from("atualizacoes_itens")
    .select("id, atualizacao_id, numero_chamado, tipo, local, descricao, created_at")
    .in(
      "atualizacao_id",
      atualizacoes.map((a) => a.id),
    )
    .order("created_at", { ascending: true });

  if (itensError) throw itensError;

  const itensByAtualizacaoId = new Map<number, AtualizacaoItem[]>();
  for (const item of itens ?? []) {
    const list = itensByAtualizacaoId.get(item.atualizacao_id) ?? [];
    list.push({
      id: item.id,
      numeroChamado: item.numero_chamado,
      tipo: item.tipo as AtualizacaoItem["tipo"],
      local: item.local,
      descricao: item.descricao,
      createdAt: item.created_at,
    });
    itensByAtualizacaoId.set(item.atualizacao_id, list);
  }

  return atualizacoes.map((a) => ({
    id: a.id,
    numeroPatch: a.numero_patch,
    dataHora: a.data_hora,
    createdAt: a.created_at,
    versaoAtual: a.versao_atual,
    itens: itensByAtualizacaoId.get(a.id) ?? [],
  }));
}
