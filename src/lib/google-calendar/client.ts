import { JWT } from "google-auth-library";
import { TIPO_LABEL } from "@/modules/calendario/utils";
import type { CompromissoTipo } from "@/modules/calendario/types";

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

// Service Account com delegação em todo o domínio (Workspace granvale.com.br
// > Admin Console > Segurança > Controle de acesso a dados > Delegação em
// todo o domínio) — "subject" faz a Service Account agir EM NOME do e-mail
// informado, sem esse usuário precisar autorizar nada manualmente.
function getClient(impersonateEmail: string): JWT {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !privateKey) {
    throw new Error(
      "Google Service Account não configurado (GOOGLE_SERVICE_ACCOUNT_EMAIL/GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ausentes).",
    );
  }

  return new JWT({ email, key: privateKey, scopes: SCOPES, subject: impersonateEmail });
}

export interface CalendarEventInput {
  titulo: string;
  descricao: string | null;
  inicio: string; // ISO
  fim: string | null; // ISO — quando ausente, o evento dura 1h a partir do início
  tipo: CompromissoTipo | null;
  empresaNome: string | null;
  // "Lead Nº L001/26" ou "Proposta Nº P001/26" — quando a Ação foi criada a
  // partir de um card do Lead/Pipeline, não pelo formulário avulso do
  // Calendário.
  cardLabel: string | null;
}

function toEventBody(input: CalendarEventInput) {
  const inicio = new Date(input.inicio);
  const fim = input.fim ? new Date(input.fim) : new Date(inicio.getTime() + 60 * 60 * 1000);

  const descricaoPartes = [];
  if (input.empresaNome) descricaoPartes.push(`Empresa: ${input.empresaNome}`);
  if (input.cardLabel) descricaoPartes.push(input.cardLabel);
  if (input.descricao) descricaoPartes.push(input.descricao);

  return {
    summary: input.tipo ? `[${TIPO_LABEL[input.tipo]}] ${input.titulo}` : input.titulo,
    description: descricaoPartes.length > 0 ? descricaoPartes.join("\n\n") : undefined,
    start: { dateTime: inicio.toISOString(), timeZone: "America/Sao_Paulo" },
    end: { dateTime: fim.toISOString(), timeZone: "America/Sao_Paulo" },
  };
}

async function calendarRequest(
  client: JWT,
  method: string,
  path: string,
  body?: unknown,
): Promise<Record<string, unknown> | null> {
  const { token } = await client.getAccessToken();
  const res = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Calendar API ${method} ${path} falhou (${res.status}): ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function createCalendarEvent(
  responsavelEmail: string,
  input: CalendarEventInput,
): Promise<string> {
  const client = getClient(responsavelEmail);
  const data = await calendarRequest(
    client,
    "POST",
    "/calendars/primary/events",
    toEventBody(input),
  );
  return data!.id as string;
}

export async function updateCalendarEvent(
  responsavelEmail: string,
  eventId: string,
  input: CalendarEventInput,
): Promise<void> {
  const client = getClient(responsavelEmail);
  await calendarRequest(
    client,
    "PATCH",
    `/calendars/primary/events/${eventId}`,
    toEventBody(input),
  );
}

export async function deleteCalendarEvent(
  responsavelEmail: string,
  eventId: string,
): Promise<void> {
  const client = getClient(responsavelEmail);
  try {
    await calendarRequest(client, "DELETE", `/calendars/primary/events/${eventId}`);
  } catch (err) {
    // Evento já pode ter sido apagado direto no Google — não é um erro fatal.
    if (!(err instanceof Error) || !err.message.includes("(404)")) throw err;
  }
}
