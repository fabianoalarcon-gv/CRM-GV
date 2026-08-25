import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { timingSafeEqual } from "@/lib/timingSafeEqual";

// Chamada 1x por dia pelo Vercel Cron (ver vercel.json) — apaga logs de
// logs_auditoria mais antigos que parametros_auditoria.dias_retencao
// (configurável em Parâmetros > Auditoria).
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET não configurado" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !timingSafeEqual(authHeader, `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: parametros, error: parametrosError } = await supabase
    .from("parametros_auditoria")
    .select("dias_retencao")
    .eq("id", 1)
    .single();
  if (parametrosError) {
    return NextResponse.json({ error: parametrosError.message }, { status: 500 });
  }

  const cutoff = new Date(Date.now() - parametros.dias_retencao * 24 * 60 * 60 * 1000).toISOString();

  const { error, count } = await supabase
    .from("logs_auditoria")
    .delete({ count: "exact" })
    .lt("created_at", cutoff);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, diasRetencao: parametros.dias_retencao, removidos: count });
}
