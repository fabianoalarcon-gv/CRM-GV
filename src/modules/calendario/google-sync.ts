import { createClient } from "@/lib/supabase/server";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,
  type CalendarEventInput,
} from "@/lib/google-calendar/client";
import type { CompromissoTipo } from "./types";

type Supabase = Awaited<ReturnType<typeof createClient>>;

// E-mail padrão de envio do sistema — recebe os eventos do calendário junto
// com todos os usuários ativos, sempre.
const EMAIL_SISTEMA_PADRAO = "crm@granvale.com.br";

export interface CompromissoSyncData {
  titulo: string;
  descricao: string | null;
  inicio: string;
  fim: string | null;
  tipo: CompromissoTipo | null;
  empresa_id: number | null;
  proposta_id: number | null;
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

async function resolveEmpresaNome(
  supabase: Supabase,
  empresaId: number | null,
): Promise<string | null> {
  if (!empresaId) return null;
  const { data } = await supabase.from("empresas").select("nome").eq("id", empresaId).maybeSingle();
  return data?.nome ?? null;
}

// Proposta e Lead são a mesma linha da tabela propostas — só numero_proposta
// vs. numero_lead diferencia o estágio, mesma lógica de
// private.notificar_proposta_insert() no banco.
async function resolveCardLabel(
  supabase: Supabase,
  propostaId: number | null,
): Promise<string | null> {
  if (!propostaId) return null;
  const { data } = await supabase
    .from("propostas")
    .select("numero_lead, numero_proposta")
    .eq("id", propostaId)
    .maybeSingle();
  if (!data) return null;
  if (data.numero_proposta) return `Proposta Nº ${data.numero_proposta}`;
  if (data.numero_lead) return `Lead Nº ${data.numero_lead}`;
  return null;
}

async function buildEventInput(
  supabase: Supabase,
  data: CompromissoSyncData,
): Promise<CalendarEventInput> {
  const [empresaNome, cardLabel] = await Promise.all([
    resolveEmpresaNome(supabase, data.empresa_id),
    resolveCardLabel(supabase, data.proposta_id),
  ]);
  return {
    titulo: data.titulo,
    descricao: data.descricao,
    inicio: data.inicio,
    fim: data.fim,
    tipo: data.tipo,
    empresaNome,
    cardLabel,
  };
}

export async function syncCompromissoCreated(
  supabase: Supabase,
  compromissoId: number,
  data: CompromissoSyncData,
): Promise<void> {
  if (!(await isGoogleCalendarAtivo(supabase))) return;

  const eventInput = await buildEventInput(supabase, data);
  const emails = await resolveTargetEmails(supabase);
  const created = await Promise.all(
    emails.map(async (email) => {
      try {
        const googleEventId = await createCalendarEvent(email, eventInput);
        return { compromisso_id: compromissoId, email, google_event_id: googleEventId };
      } catch (err) {
        console.error(`Falha ao criar evento no Google Calendar (${email})`, err);
        return null;
      }
    }),
  );

  const rows = created.filter((r): r is NonNullable<typeof r> => r !== null);
  if (rows.length > 0) {
    const { error } = await supabase.from("compromisso_google_events").insert(rows);
    if (error) console.error("Falha ao salvar ids de eventos do Google Calendar", error);
  }
}

export async function syncCompromissoUpdated(
  supabase: Supabase,
  compromissoId: number,
  data: CompromissoSyncData,
): Promise<void> {
  if (!(await isGoogleCalendarAtivo(supabase))) return;

  const { data: existingEvents } = await supabase
    .from("compromisso_google_events")
    .select("email, google_event_id")
    .eq("compromisso_id", compromissoId);

  if (!existingEvents || existingEvents.length === 0) return;

  const eventInput = await buildEventInput(supabase, data);
  await Promise.all(
    existingEvents.map(async (e) => {
      try {
        await updateCalendarEvent(e.email, e.google_event_id, eventInput);
      } catch (err) {
        console.error(`Falha ao atualizar evento no Google Calendar (${e.email})`, err);
      }
    }),
  );
}

export async function syncCompromissoDeleted(
  supabase: Supabase,
  compromissoId: number,
): Promise<void> {
  const { data: existingEvents } = await supabase
    .from("compromisso_google_events")
    .select("email, google_event_id")
    .eq("compromisso_id", compromissoId);

  if (!existingEvents || existingEvents.length === 0) return;

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
