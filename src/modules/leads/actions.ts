"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isBeforeToday, parseBrasiliaDateTime } from "@/modules/calendario/utils";
import { syncCompromissoCreated, syncCompromissoDeleted } from "@/modules/calendario/google-sync";
import type { AcaoInput, LeadInput, Repeticao } from "./types";

const MAX_REPETICOES = 100;

function revalidateLeadPaths() {
  revalidatePath("/leads");
  revalidatePath("/pipeline");
}

// Desloca uma data pra frente conforme o padrão de repetição — index 0 é
// sempre a data original (primeira ocorrência), sem deslocamento.
function shiftDate(date: Date, repeticao: Repeticao, occurrenceIndex: number): Date {
  if (occurrenceIndex === 0) return date;
  const shifted = new Date(date);

  switch (repeticao) {
    case "diaria":
      shifted.setDate(shifted.getDate() + occurrenceIndex);
      break;
    case "semanal":
      shifted.setDate(shifted.getDate() + occurrenceIndex * 7);
      break;
    case "mensal":
      shifted.setMonth(shifted.getMonth() + occurrenceIndex);
      break;
    case "anual":
      shifted.setFullYear(shifted.getFullYear() + occurrenceIndex);
      break;
    case "dias_uteis": {
      let remaining = occurrenceIndex;
      while (remaining > 0) {
        shifted.setDate(shifted.getDate() + 1);
        const day = shifted.getDay();
        if (day !== 0 && day !== 6) remaining--;
      }
      break;
    }
    case "nao_repete":
    default:
      break;
  }

  return shifted;
}

export async function createLead(input: LeadInput) {
  if (!input.empresa_id) return { error: "Selecione a empresa." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("propostas").insert({
    empresa_id: input.empresa_id,
    data_inicio_lead: input.data_inicio_lead,
    termometro: input.termometro,
    descricao: input.descricao.trim() || null,
    segmento: input.segmento,
    valor: input.valor_estimado,
    status_id: input.status_id,
    responsavel_id: input.responsavel_id,
    created_by: user?.id ?? null,
  });

  if (error) return { error: error.message };

  revalidateLeadPaths();
  return { error: null };
}

export async function updateLead(leadId: number, input: LeadInput) {
  if (!input.empresa_id) return { error: "Selecione a empresa." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("propostas")
    .update({
      empresa_id: input.empresa_id,
      data_inicio_lead: input.data_inicio_lead,
      termometro: input.termometro,
      descricao: input.descricao.trim() || null,
      segmento: input.segmento,
      valor: input.valor_estimado,
      status_id: input.status_id,
      responsavel_id: input.responsavel_id,
    })
    .eq("id", leadId);

  if (error) return { error: error.message };

  revalidateLeadPaths();
  return { error: null };
}

// Promove um Lead (Qualificação) a Proposta formal no Pipeline: mesma
// linha, muda de estágio, ganha um Número de Proposta novo (o Número do
// Lead já existente é o que rastreia a origem) e a marca `gerado_de_lead`
// (é o que habilita reverter depois).
export async function gerarProposta(leadId: number) {
  const supabase = await createClient();

  const { data: status, error: statusError } = await supabase
    .from("proposal_statuses")
    .select("id")
    .eq("key", "proposta")
    .single();
  if (statusError || !status) return { error: "Não foi possível encontrar o status Proposta." };

  const { data: numeroProposta, error: numeroError } = await supabase.rpc("gerar_numero_proposta");
  if (numeroError) return { error: numeroError.message };

  const { error } = await supabase
    .from("propostas")
    .update({ status_id: status.id, numero_proposta: numeroProposta, gerado_de_lead: true })
    .eq("id", leadId);

  if (error) return { error: error.message };

  revalidateLeadPaths();
  return { error: null };
}

// Desfaz gerarProposta: só relevante pra propostas com gerado_de_lead=true
// (a UI só mostra a opção nesse caso). Limpa o Número da Proposta pra não
// sobrar um número "queimado" sem uso; se gerar de novo depois, ganha outro.
export async function reverterParaQualificacao(propostaId: number) {
  const supabase = await createClient();

  const { data: status, error: statusError } = await supabase
    .from("proposal_statuses")
    .select("id")
    .eq("key", "qualificacao")
    .single();
  if (statusError || !status) return { error: "Não foi possível encontrar o status Qualificação." };

  const { error } = await supabase
    .from("propostas")
    .update({ status_id: status.id, numero_proposta: null, gerado_de_lead: false })
    .eq("id", propostaId);

  if (error) return { error: error.message };

  revalidateLeadPaths();
  return { error: null };
}

// Arquiva um Lead (Prospecção/Qualificação): guarda o status atual em
// status_anterior_id pra "Reativar" saber pra onde voltar.
export async function arquivarLead(leadId: number, statusAtualId: number) {
  const supabase = await createClient();

  const { data: status, error: statusError } = await supabase
    .from("proposal_statuses")
    .select("id")
    .eq("key", "arquivado")
    .single();
  if (statusError || !status) return { error: "Não foi possível encontrar o status Arquivado." };

  const { error } = await supabase
    .from("propostas")
    .update({ status_id: status.id, status_anterior_id: statusAtualId })
    .eq("id", leadId);

  if (error) return { error: error.message };

  revalidateLeadPaths();
  return { error: null };
}

// Desfaz arquivarLead: volta pro status guardado em status_anterior_id (ou
// Prospecção, se por algum motivo não tiver sido guardado).
export async function reativarLead(leadId: number, statusAnteriorId: number | null) {
  const supabase = await createClient();

  let targetStatusId = statusAnteriorId;
  if (!targetStatusId) {
    const { data: prospeccaoStatus, error: statusError } = await supabase
      .from("proposal_statuses")
      .select("id")
      .eq("key", "prospeccao")
      .single();
    if (statusError || !prospeccaoStatus) {
      return { error: "Não foi possível encontrar o status Prospecção." };
    }
    targetStatusId = prospeccaoStatus.id;
  }

  const { error } = await supabase
    .from("propostas")
    .update({ status_id: targetStatusId, status_anterior_id: null })
    .eq("id", leadId);

  if (error) return { error: error.message };

  revalidateLeadPaths();
  return { error: null };
}

export async function createAcao(leadId: number, empresaId: number, input: AcaoInput) {
  if (!input.titulo.trim()) return { error: "Informe o título da ação." };
  if (!input.inicio) return { error: "Informe a data/hora de início." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada, faça login novamente." };

  const baseInicio = parseBrasiliaDateTime(input.inicio);
  const baseFim = input.fim ? parseBrasiliaDateTime(input.fim) : null;
  // quantidadeRepeticoes é quantas vezes a ação SE REPETE além da original
  // (ex: semanal + 1 repetição = evento de hoje + 1 daqui a uma semana = 2
  // ocorrências no total).
  const totalOcorrencias =
    input.repeticao === "nao_repete"
      ? 1
      : Math.min(Math.max(input.quantidadeRepeticoes, 1), MAX_REPETICOES) + 1;

  const rows = Array.from({ length: totalOcorrencias }, (_, i) => {
    const inicio = shiftDate(baseInicio, input.repeticao, i);
    const fim = baseFim ? shiftDate(baseFim, input.repeticao, i) : null;
    return {
      titulo: input.titulo.trim(),
      descricao: input.descricao.trim() || null,
      inicio: inicio.toISOString(),
      fim: fim ? fim.toISOString() : null,
      tipo: input.tipo,
      empresa_id: empresaId,
      proposta_id: leadId,
      criado_por: user.id,
    };
  });

  const { data: inserted, error } = await supabase.from("compromissos").insert(rows).select("id");

  if (error) return { error: error.message };

  // Uma ocorrência por linha inserida (repetição gera várias) — cada uma vira
  // um evento próprio no Google Calendar, todas com o número do Lead/Proposta
  // que originou a Ação.
  await Promise.all(
    inserted.map((row, i) =>
      syncCompromissoCreated(supabase, row.id, {
        titulo: rows[i].titulo,
        descricao: rows[i].descricao,
        inicio: rows[i].inicio,
        fim: rows[i].fim,
        tipo: rows[i].tipo,
        empresa_id: rows[i].empresa_id,
        proposta_id: rows[i].proposta_id,
      }),
    ),
  );

  revalidateLeadPaths();
  revalidatePath("/calendario");
  return { error: null };
}

// Ações já realizadas (inicio antes de hoje) não podem ser excluídas — só
// valida no servidor de novo aqui porque a UI já bloqueia, mas quem chama a
// action direto (ou com estado desatualizado) não pode contornar a regra.
// "esta_e_futuras" apaga a partir da data desta ação (inclusive), só dentro
// do mesmo Lead/Proposta — outro Lead/Proposta da mesma empresa não é tocado.
export async function deleteAcao(
  compromissoId: number,
  propostaId: number,
  escopo: "somente_esta" | "esta_e_futuras",
) {
  const supabase = await createClient();

  const { data: acao, error: fetchError } = await supabase
    .from("compromissos")
    .select("inicio")
    .eq("id", compromissoId)
    .single();
  if (fetchError || !acao) return { error: fetchError?.message ?? "Ação não encontrada." };

  if (isBeforeToday(acao.inicio)) {
    return { error: "Ações que já passaram não podem ser excluídas." };
  }

  // Precisa saber QUAIS linhas serão apagadas antes de apagar, pra limpar o
  // evento correspondente de cada uma no Google Calendar.
  const idsQuery =
    escopo === "somente_esta"
      ? supabase.from("compromissos").select("id").eq("id", compromissoId)
      : supabase
          .from("compromissos")
          .select("id")
          .eq("proposta_id", propostaId)
          .gte("inicio", acao.inicio);
  const { data: idsParaExcluir } = await idsQuery;

  if (idsParaExcluir && idsParaExcluir.length > 0) {
    await Promise.all(idsParaExcluir.map((row) => syncCompromissoDeleted(supabase, row.id)));
  }

  const { error } =
    escopo === "somente_esta"
      ? await supabase.from("compromissos").delete().eq("id", compromissoId)
      : await supabase
          .from("compromissos")
          .delete()
          .eq("proposta_id", propostaId)
          .gte("inicio", acao.inicio);

  if (error) return { error: error.message };

  revalidateLeadPaths();
  revalidatePath("/calendario");
  return { error: null };
}
