import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import {
  buildLeadPropostaEmailBody,
  buildMovimentacaoCardEmailBody,
  buildNovaAcaoEmailBody,
  buildNovaEmpresaEmailBody,
  buildPropostaResultadoEmailBody,
  buildSimpleEmailBody,
} from "@/lib/email/templates";
import { NOTIFICACAO_TIPO_LABEL } from "@/modules/notificacoes/utils";
import type { NotificacaoTipo } from "@/modules/notificacoes/types";

const TIPOS_LEAD_PROPOSTA: NotificacaoTipo[] = ["novo_lead", "nova_proposta"];

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
  const record = payload?.record as
    | {
        tipo?: NotificacaoTipo;
        mensagem?: string;
        proposta_id?: number | null;
        empresa_id?: number | null;
        compromisso_id?: number | null;
        autor_id?: string | null;
        status_anterior_label?: string | null;
        status_novo_label?: string | null;
      }
    | undefined;
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

  let html: string;
  if (TIPOS_LEAD_PROPOSTA.includes(record.tipo) && record.proposta_id) {
    const { data: proposta } = await admin
      .from("propostas")
      .select(
        "numero_lead, numero_proposta, created_at, descricao, termometro, segmento, valor, empresas(nome), proposal_statuses!status_id(label), responsavel:profiles!responsavel_id(full_name)",
      )
      .eq("id", record.proposta_id)
      .maybeSingle();

    html = proposta
      ? buildLeadPropostaEmailBody({
          numeroLead: proposta.numero_lead,
          numeroProposta: proposta.numero_proposta,
          createdAt: proposta.created_at,
          empresaNome: proposta.empresas?.nome ?? null,
          descricao: proposta.descricao,
          termometro: proposta.termometro,
          segmento: proposta.segmento,
          valor: proposta.valor,
          statusLabel: proposta.proposal_statuses?.label ?? null,
          responsavelNome: proposta.responsavel?.full_name ?? null,
        })
      : buildSimpleEmailBody(record.mensagem);
  } else if (record.tipo === "nova_empresa" && record.empresa_id) {
    const [{ data: empresa }, { data: autor }] = await Promise.all([
      admin.from("empresas").select("nome").eq("id", record.empresa_id).maybeSingle(),
      record.autor_id
        ? admin.from("profiles").select("full_name").eq("id", record.autor_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    html = empresa
      ? buildNovaEmpresaEmailBody({
          empresaNome: empresa.nome,
          autorNome: autor?.full_name ?? null,
        })
      : buildSimpleEmailBody(record.mensagem);
  } else if (record.tipo === "movimentacao_card" && record.proposta_id) {
    const [{ data: proposta }, { data: autor }] = await Promise.all([
      admin
        .from("propostas")
        .select("numero_lead, numero_proposta, empresas(nome)")
        .eq("id", record.proposta_id)
        .maybeSingle(),
      record.autor_id
        ? admin.from("profiles").select("full_name").eq("id", record.autor_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    html = proposta
      ? buildMovimentacaoCardEmailBody({
          numeroLead: proposta.numero_lead,
          numeroProposta: proposta.numero_proposta,
          empresaNome: proposta.empresas?.nome ?? null,
          statusAnterior: record.status_anterior_label ?? null,
          statusNovo: record.status_novo_label ?? null,
          autorNome: autor?.full_name ?? null,
        })
      : buildSimpleEmailBody(record.mensagem);
  } else if (
    (record.tipo === "proposta_aprovada" || record.tipo === "proposta_reprovada") &&
    record.proposta_id
  ) {
    const [{ data: proposta }, { data: autor }] = await Promise.all([
      admin
        .from("propostas")
        .select("numero_proposta, empresas(nome)")
        .eq("id", record.proposta_id)
        .maybeSingle(),
      record.autor_id
        ? admin.from("profiles").select("full_name").eq("id", record.autor_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    html = proposta?.numero_proposta
      ? buildPropostaResultadoEmailBody({
          numeroProposta: proposta.numero_proposta,
          empresaNome: proposta.empresas?.nome ?? null,
          aprovado: record.tipo === "proposta_aprovada",
          autorNome: autor?.full_name ?? null,
        })
      : buildSimpleEmailBody(record.mensagem);
  } else if (record.tipo === "nova_acao" && record.compromisso_id) {
    const { data: compromisso } = await admin
      .from("compromissos")
      .select(
        "titulo, descricao, inicio, fim, tipo, created_at, empresas(nome), propostas(numero_lead, numero_proposta), profiles(full_name)",
      )
      .eq("id", record.compromisso_id)
      .maybeSingle();

    html = compromisso
      ? buildNovaAcaoEmailBody({
          titulo: compromisso.titulo,
          inicio: compromisso.inicio,
          fim: compromisso.fim,
          tipo: compromisso.tipo,
          numeroLead: compromisso.propostas?.numero_lead ?? null,
          numeroProposta: compromisso.propostas?.numero_proposta ?? null,
          empresaNome: compromisso.empresas?.nome ?? null,
          descricao: compromisso.descricao,
          autorNome: compromisso.profiles?.full_name ?? null,
          createdAt: compromisso.created_at,
        })
      : buildSimpleEmailBody(record.mensagem);
  } else {
    html = buildSimpleEmailBody(record.mensagem);
  }

  try {
    await sendEmail({
      to: recipients,
      subject: NOTIFICACAO_TIPO_LABEL[record.tipo] ?? "Notificação CRM",
      html,
      fromName: params.nome_remetente,
    });
  } catch (err) {
    console.error("Falha ao enviar e-mail de notificação", err);
    return NextResponse.json({ error: "falha no envio" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, enviados: recipients.length });
}
