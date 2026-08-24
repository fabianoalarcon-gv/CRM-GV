"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isValidMotivoReprovacao, isValidNumeroProposta } from "./validation";
import type { HistoricoTipo, ProposalInput } from "./types";

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

function toRow(input: ProposalInput) {
  return {
    numero_proposta: input.numero_proposta.trim(),
    data_envio: input.data_envio,
    empresa_id: input.empresa_id,
    servico: input.servico.trim() || null,
    descricao: input.descricao.trim() || null,
    segmentos: input.segmentos,
    valor: input.valor,
    status_id: input.status_id,
    termometro: input.termometro,
    tipo_servico: input.tipo_servico,
    responsavel_id: input.responsavel_id,
    resultado: input.resultado,
    // Só guarda motivo quando o resultado realmente é reprovado — evita um
    // motivo "fantasma" sobrevivendo se o usuário mudar de ideia depois.
    motivo_reprovacao: input.resultado === "reprovado" ? input.motivo_reprovacao || null : null,
    // Detalhe só existe quando o motivo escolhido é "Outro" — trim/slice de
    // novo aqui é só uma garantia extra (o client já limita a 50 caracteres).
    motivo_reprovacao_detalhe:
      input.resultado === "reprovado" && input.motivo_reprovacao === "outro"
        ? input.motivo_reprovacao_detalhe.trim().slice(0, 50) || null
        : null,
  };
}

function friendlyError(error: { code?: string; message: string }): string {
  if (error.code === "23505") return "Já existe uma proposta com esse número.";
  return error.message;
}

export async function createProposal(input: ProposalInput) {
  if (
    !isValidMotivoReprovacao(
      input.resultado,
      input.motivo_reprovacao,
      input.motivo_reprovacao_detalhe,
    )
  ) {
    return { error: "Informe o motivo da reprovação." };
  }

  const supabase = await createClient();

  // Número da proposta é sempre gerado pelo sistema na criação (PNNN/AA,
  // mesmo contador usado em "Gerar Proposta") — o usuário não digita mais.
  const { data: numeroProposta, error: numeroError } = await supabase.rpc("gerar_numero_proposta");
  if (numeroError) return { error: numeroError.message };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("propostas")
    .insert({ ...toRow(input), numero_proposta: numeroProposta, created_by: user?.id ?? null });

  if (error) return { error: friendlyError(error) };

  revalidatePath("/pipeline");
  revalidatePath("/leads");
  return { error: null };
}

export async function updateProposal(proposalId: number, input: ProposalInput) {
  if (!isValidNumeroProposta(input.numero_proposta)) {
    return { error: "Número da proposta inválido. Use o formato NNN/AA (ex: 028/25)." };
  }
  if (
    !isValidMotivoReprovacao(
      input.resultado,
      input.motivo_reprovacao,
      input.motivo_reprovacao_detalhe,
    )
  ) {
    return { error: "Informe o motivo da reprovação." };
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
