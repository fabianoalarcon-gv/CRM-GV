import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { NOTIFICACAO_TIPO_LABEL } from "@/modules/notificacoes/utils";
import type { NotificacaoTipo } from "@/modules/notificacoes/types";

// Chamada pelo Supabase Database Webhook (Database > Webhooks) a cada INSERT
// na tabela notificacoes — mesmo funil de eventos já usado pelo sino de
// notificações in-app (novo Lead, nova Proposta, nova Ação, etc.), sem
// precisar duplicar lógica de "quando notificar" em cada Server Action. O
// Supabase autentica a própria chamada enviando o header configurado no
// painel; validamos aqui contra SUPABASE_WEBHOOK_SECRET, mesmo padrão do
// CRON_SECRET usado pelas rotas /api/cron.
export async function POST(request: Request) {
  if (!process.env.SUPABASE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "SUPABASE_WEBHOOK_SECRET não configurado" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.SUPABASE_WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const record = payload?.record as { tipo?: NotificacaoTipo; mensagem?: string } | undefined;
  if (!record?.tipo || !record.mensagem) {
    return NextResponse.json({ ok: true, skipped: "payload sem notificação" });
  }

  const admin = createAdminClient();

  const { data: params } = await admin
    .from("parametros_email")
    .select("ativo, nome_remetente, modo_teste, email_teste, tipos_habilitados")
    .eq("id", 1)
    .maybeSingle();

  if (!params?.ativo) return NextResponse.json({ ok: true, skipped: "envio de e-mail desativado" });
  if (!params.tipos_habilitados.includes(record.tipo)) {
    return NextResponse.json({ ok: true, skipped: "tipo não habilitado para e-mail" });
  }

  let recipients: string[];
  if (params.modo_teste) {
    if (!params.email_teste) {
      return NextResponse.json({ ok: true, skipped: "modo teste sem e-mail de teste configurado" });
    }
    recipients = [params.email_teste];
  } else {
    const { data: profiles } = await admin
      .from("profiles")
      .select("email")
      .eq("is_active", true)
      .eq("email_notifications", true);
    recipients = (profiles ?? []).map((p) => p.email);
  }

  if (recipients.length === 0) {
    return NextResponse.json({ ok: true, skipped: "sem destinatários" });
  }

  try {
    await sendEmail({
      to: recipients,
      subject: NOTIFICACAO_TIPO_LABEL[record.tipo] ?? "Notificação CRM",
      html: `<p>${record.mensagem}</p>`,
      fromName: params.nome_remetente,
    });
  } catch (err) {
    console.error("Falha ao enviar e-mail de notificação", err);
    return NextResponse.json({ error: "falha no envio" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, enviados: recipients.length });
}
