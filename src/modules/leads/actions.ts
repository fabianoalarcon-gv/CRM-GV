"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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
  if (!input.cliente_id) return { error: "Selecione o cliente." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("propostas").insert({
    cliente_id: input.cliente_id,
    termometro: input.termometro,
    descricao: input.descricao.trim() || null,
    segmento: input.segmento,
    valor: input.valor_estimado,
    status_id: input.status_id,
    created_by: user?.id ?? null,
  });

  if (error) return { error: error.message };

  revalidateLeadPaths();
  return { error: null };
}

export async function updateLead(leadId: number, input: LeadInput) {
  if (!input.cliente_id) return { error: "Selecione o cliente." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("propostas")
    .update({
      cliente_id: input.cliente_id,
      termometro: input.termometro,
      descricao: input.descricao.trim() || null,
      segmento: input.segmento,
      valor: input.valor_estimado,
      status_id: input.status_id,
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

export async function createAcao(leadId: number, clienteId: number, input: AcaoInput) {
  if (!input.titulo.trim()) return { error: "Informe o título da ação." };
  if (!input.inicio) return { error: "Informe a data/hora de início." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada, faça login novamente." };

  const baseInicio = new Date(input.inicio);
  const baseFim = input.fim ? new Date(input.fim) : null;
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
      cliente_id: clienteId,
      proposta_id: leadId,
      criado_por: user.id,
    };
  });

  const { error } = await supabase.from("compromissos").insert(rows);

  if (error) return { error: error.message };

  revalidateLeadPaths();
  revalidatePath("/calendario");
  return { error: null };
}
