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

// E-mail padrão de envio do sistema — recebe os eventos do calendário junto
// com todos os usuários ativos, sempre.
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

// Toda Ação vai para a agenda de todo usuário ativo que tenha marcado
// "Sincronizar com Google Calendar" no cadastro (nem todo usuário tem e-mail
// dentro do Workspace granvale.com.br — só quem tem deve ser incluído), mais
// a de crm@granvale.com.br. Cada agenda recebe seu próprio evento (não é um
// único evento com convidados), então uma falha numa agenda não afeta as
// demais.
async function resolveTargetEmails(supabase: Supabase): Promise<string[]> {
  const { data } = await supabase
    .from("profiles")
    .select("email")
    .eq("is_active", true)
    .eq("google_calendar_sync", true);
  const emails = new Set((data ?? []).map((p) => p.email));
  emails.add(EMAIL_SISTEMA_PADRAO);
  return Array.from(emails);
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
    const emails = await resolveTargetEmails(supabase);
    const created = await Promise.all(
      emails.map(async (email) => {
        try {
          const googleEventId = await createCalendarEvent(email, row);
          return { compromisso_id: inserted.id, email, google_event_id: googleEventId };
        } catch (err) {
          console.error(`Falha ao criar evento no Google Calendar (${email})`, err);
          return null;
        }
      }),
    );

    const rows = created.filter((r): r is NonNullable<typeof r> => r !== null);
    if (rows.length > 0) {
      const { error: eventsError } = await supabase.from("compromisso_google_events").insert(rows);
      if (eventsError)
        console.error("Falha ao salvar ids de eventos do Google Calendar", eventsError);
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
  const { error } = await supabase.from("compromissos").update(row).eq("id", compromissoId);

  if (error) return { error: error.message };

  if (await isGoogleCalendarAtivo(supabase)) {
    const { data: existingEvents } = await supabase
      .from("compromisso_google_events")
      .select("email, google_event_id")
      .eq("compromisso_id", compromissoId);

    if (existingEvents && existingEvents.length > 0) {
      await Promise.all(
        existingEvents.map(async (e) => {
          try {
            await updateCalendarEvent(e.email, e.google_event_id, row);
          } catch (err) {
            console.error(`Falha ao atualizar evento no Google Calendar (${e.email})`, err);
          }
        }),
      );
    }
  }

  revalidatePath("/calendario");
  return { error: null };
}

export async function deleteCompromisso(compromissoId: number) {
  const supabase = await createClient();

  const { data: existingEvents } = await supabase
    .from("compromisso_google_events")
    .select("email, google_event_id")
    .eq("compromisso_id", compromissoId);

  const { error } = await supabase.from("compromissos").delete().eq("id", compromissoId);
  if (error) return { error: error.message };

  if (existingEvents && existingEvents.length > 0) {
    await Promise.all(
      existingEvents.map(async (e) => {
        try {
          await deleteCalendarEvent(e.email, e.google_event_id);
        } catch (err) {
          console.error(`Falha ao excluir evento no Google Calendar (${e.email})`, err);
        }
      }),
    );
  }

  revalidatePath("/calendario");
  return { error: null };
}
