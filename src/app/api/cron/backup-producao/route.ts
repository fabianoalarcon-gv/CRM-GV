import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { timingSafeEqual } from "@/lib/timingSafeEqual";
import type { Database } from "@/lib/supabase/database.types";

export const maxDuration = 60;

// Todas as tabelas de negócio do schema public (ver supabase/migrations) —
// o schema em si já está versionado no git, então o backup aqui é só dos
// dados. auth.users não dá pra copiar via API (sem hash de senha), por isso
// guardamos só id/email/created_at pra referência, não pra restaurar login.
const TABLES = [
  "profiles",
  "proposal_statuses",
  "empresas",
  "contatos_empresa",
  "interacoes_empresa",
  "propostas",
  "propostas_historico",
  "compromissos",
  "compromisso_google_events",
  "lead_number_counters",
  "proposta_number_counters",
  "captacoes",
  "notificacoes",
  "notificacoes_lidas",
  "propostas_status_historico",
  "atualizacoes",
  "atualizacoes_itens",
  "atualizacoes_vistas",
  "parametros_notificacao",
  "parametros_retomada_lead_arquivado",
  "retomada_lead_arquivado_gerada",
  "parametros_email",
  "parametros_google_calendar",
] as const satisfies readonly (keyof Database["public"]["Tables"])[];

const BUCKET = "backups-producao";
const RETENTION_DAYS = 14;

// Chamada 1x por dia pelo Vercel Cron (ver vercel.json) — mesmo padrão de
// autenticação das outras rotas /api/cron. Faz um snapshot (não PITR de
// verdade) dos dados de produção e guarda como JSON num bucket do projeto
// Supabase Dev — infraestrutura separada da de produção, então um problema
// no projeto de produção não leva o backup junto.
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET não configurado" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !timingSafeEqual(authHeader, `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const backupUrl = process.env.BACKUP_STORAGE_SUPABASE_URL;
  const backupKey = process.env.BACKUP_STORAGE_SUPABASE_SERVICE_KEY;
  if (!backupUrl || !backupKey) {
    return NextResponse.json({ error: "BACKUP_STORAGE_* não configurado" }, { status: 500 });
  }

  const prod = createAdminClient();
  const backupClient = createClient(backupUrl, backupKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const tabelas: Record<string, unknown[]> = {};
  for (const table of TABLES) {
    const { data, error } = await prod.from(table).select("*");
    if (error) {
      return NextResponse.json({ error: `select ${table}: ${error.message}` }, { status: 500 });
    }
    tabelas[table] = data ?? [];
  }

  const { data: authUsers, error: authErr } = await prod.auth.admin.listUsers({ perPage: 1000 });
  if (authErr) {
    return NextResponse.json({ error: `listUsers: ${authErr.message}` }, { status: 500 });
  }

  const dump = {
    geradoEm: new Date().toISOString(),
    usuarios: authUsers.users.map((u) => ({ id: u.id, email: u.email, created_at: u.created_at })),
    tabelas,
  };

  const fileName = `backup-${new Date().toISOString().slice(0, 10)}.json`;
  const { error: uploadError } = await backupClient.storage
    .from(BUCKET)
    .upload(fileName, JSON.stringify(dump), { contentType: "application/json", upsert: true });
  if (uploadError) {
    return NextResponse.json({ error: `upload: ${uploadError.message}` }, { status: 500 });
  }

  // Retenção: apaga backups mais antigos que RETENTION_DAYS pra não crescer
  // o bucket pra sempre.
  const { data: files } = await backupClient.storage.from(BUCKET).list();
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const toDelete = (files ?? [])
    .filter((f) => f.name.startsWith("backup-") && new Date(f.created_at ?? 0).getTime() < cutoff)
    .map((f) => f.name);
  if (toDelete.length > 0) {
    await backupClient.storage.from(BUCKET).remove(toDelete);
  }

  return NextResponse.json({
    ok: true,
    arquivo: fileName,
    tabelas: Object.keys(tabelas).length,
    usuarios: dump.usuarios.length,
    backupsRemovidos: toDelete.length,
  });
}
