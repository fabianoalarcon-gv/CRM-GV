import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { timingSafeEqual } from "@/lib/timingSafeEqual";

// Chamada 1x por dia pelo Vercel Cron (ver vercel.json). Sem sessão de
// usuário — a Vercel autentica a própria chamada enviando
// "Authorization: Bearer <CRON_SECRET>" quando essa env var está definida no
// projeto; validamos isso aqui pra rejeitar qualquer outra origem, já que
// rotas em app/api/ não passam pelo guard de sessão do proxy.ts.
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET não configurado" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !timingSafeEqual(authHeader, `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("gerar_notificacoes_diarias");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, notificacoes_criadas: data });
}
