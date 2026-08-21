"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,
} from "@/lib/google-calendar/client";
import type { CompromissoInput } from "./types";
import { parseBrasiliaDateTime } from "./utils";

type Supabase = Awaited<ReturnType<typeof createClient>>;

// E-mail usado quando um compromisso não tem um usuário responsável (ex.
// Ações geradas automaticamente pelo cron de retomada de Lead arquivado).
const EMAIL_SISTEMA_PADRAO = "crm@granvale.com.br";

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

async function isGoogleCalendarAtivo(supabase: Supabase): Promise<boolean> {
  const { data } = await supabase
    .from("parametros_google_calendar")
    .select("ativo")
    .eq("id", 1)
    .maybeSingle();
  return data?.ativo ?? false;
}

async function resolveResponsavelEmail(
  supabase: Supabase,
  criadoPor: string | null,
): Promise<string> {
  if (!criadoPor) return EMAIL_SISTEMA_PADRAO;
  const { data } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", criadoPor)
    .maybeSingle();
  return data?.email ?? EMAIL_SISTEMA_PADRAO;
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
    .select("id")
    .single();

  if (error) return { error: error.message };

  if (await isGoogleCalendarAtivo(supabase)) {
    try {
      const eventId = await createCalendarEvent(user.email ?? EMAIL_SISTEMA_PADRAO, row);
      await supabase
        .from("compromissos")
        .update({ google_event_id: eventId })
        .eq("id", inserted.id);
    } catch (err) {
      console.error("Falha ao criar evento no Google Calendar", err);
    }
  }

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
    .select("google_event_id, criado_por")
    .single();

  if (error) return { error: error.message };

  if (updated.google_event_id && (await isGoogleCalendarAtivo(supabase))) {
    try {
      const email = await resolveResponsavelEmail(supabase, updated.criado_por);
      await updateCalendarEvent(email, updated.google_event_id, row);
    } catch (err) {
      console.error("Falha ao atualizar evento no Google Calendar", err);
    }
  }

  revalidatePath("/calendario");
  return { error: null };
}

export async function deleteCompromisso(compromissoId: number) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("compromissos")
    .select("google_event_id, criado_por")
    .eq("id", compromissoId)
    .maybeSingle();

  const { error } = await supabase.from("compromissos").delete().eq("id", compromissoId);
  if (error) return { error: error.message };

  if (existing?.google_event_id && (await isGoogleCalendarAtivo(supabase))) {
    try {
      const email = await resolveResponsavelEmail(supabase, existing.criado_por);
      await deleteCalendarEvent(email, existing.google_event_id);
    } catch (err) {
      console.error("Falha ao excluir evento no Google Calendar", err);
    }
  }

  revalidatePath("/calendario");
  return { error: null };
}
