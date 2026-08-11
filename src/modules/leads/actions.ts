"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AcaoInput, LeadInput } from "./types";

function revalidateLeadPaths() {
  revalidatePath("/leads");
  revalidatePath("/pipeline");
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

export async function createAcao(leadId: number, clienteId: number, input: AcaoInput) {
  if (!input.titulo.trim()) return { error: "Informe o título da ação." };
  if (!input.inicio) return { error: "Informe a data/hora de início." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada, faça login novamente." };

  const { error } = await supabase.from("compromissos").insert({
    titulo: input.titulo.trim(),
    descricao: input.descricao.trim() || null,
    inicio: new Date(input.inicio).toISOString(),
    fim: input.fim ? new Date(input.fim).toISOString() : null,
    tipo: input.tipo,
    cliente_id: clienteId,
    proposta_id: leadId,
    criado_por: user.id,
  });

  if (error) return { error: error.message };

  revalidateLeadPaths();
  revalidatePath("/calendario");
  return { error: null };
}
