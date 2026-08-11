"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isValidNumeroProposta } from "./validation";
import type { HistoricoTipo, ProposalInput, Resultado } from "./types";

export async function updateProposalStatus(proposalId: number, statusId: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("propostas")
    .update({ status_id: statusId })
    .eq("id", proposalId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/pipeline");
  revalidatePath("/leads");
  return { error: null };
}

export async function updateProposalResultado(proposalId: number, resultado: Resultado | null) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("propostas")
    .update({ resultado })
    .eq("id", proposalId);

  if (error) return { error: error.message };

  revalidatePath("/pipeline");
  revalidatePath("/leads");
  return { error: null };
}

function toRow(input: ProposalInput) {
  return {
    numero_proposta: input.numero_proposta.trim(),
    data_envio: input.data_envio,
    cliente_id: input.cliente_id,
    servico: input.servico.trim() || null,
    descricao: input.descricao.trim() || null,
    valor: input.valor,
    status_id: input.status_id,
    termometro: input.termometro,
    tipo_servico: input.tipo_servico,
    responsavel_id: input.responsavel_id,
    resultado: input.resultado,
  };
}

function friendlyError(error: { code?: string; message: string }): string {
  if (error.code === "23505") return "Já existe uma proposta com esse número.";
  return error.message;
}

export async function createProposal(input: ProposalInput) {
  if (!isValidNumeroProposta(input.numero_proposta)) {
    return { error: "Número da proposta inválido. Use o formato NNN/AA (ex: 028/25)." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("propostas")
    .insert({ ...toRow(input), created_by: user?.id ?? null });

  if (error) return { error: friendlyError(error) };

  revalidatePath("/pipeline");
  revalidatePath("/leads");
  return { error: null };
}

export async function updateProposal(proposalId: number, input: ProposalInput) {
  if (!isValidNumeroProposta(input.numero_proposta)) {
    return { error: "Número da proposta inválido. Use o formato NNN/AA (ex: 028/25)." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("propostas").update(toRow(input)).eq("id", proposalId);

  if (error) return { error: friendlyError(error) };

  revalidatePath("/pipeline");
  revalidatePath("/leads");
  return { error: null };
}

export async function deleteProposal(proposalId: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("propostas").delete().eq("id", proposalId);

  if (error) return { error: error.message };

  revalidatePath("/pipeline");
  revalidatePath("/leads");
  return { error: null };
}

export async function addProposalHistoryEntry(
  proposalId: number,
  texto: string,
  tipo: HistoricoTipo = "observacao",
) {
  const trimmed = texto.trim();
  if (!trimmed) return { error: "Escreva algo antes de salvar." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("propostas_historico")
    .insert({ proposta_id: proposalId, autor_id: user?.id ?? null, texto: trimmed, tipo });

  if (error) return { error: error.message };

  revalidatePath("/pipeline");
  revalidatePath("/leads");
  return { error: null };
}
