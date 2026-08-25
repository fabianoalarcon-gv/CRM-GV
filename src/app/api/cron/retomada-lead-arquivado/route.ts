import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { timingSafeEqual } from "@/lib/timingSafeEqual";

// Chamada 1x por dia pelo Vercel Cron (ver vercel.json) — mesmo padrão de
// autenticação de /api/cron/notificacoes-diarias.
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET não configurado" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !timingSafeEqual(authHeader, `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("gerar_acoes_retomada_lead_arquivado");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, acoes_criadas: data });
}
