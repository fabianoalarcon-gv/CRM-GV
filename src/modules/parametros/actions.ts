"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ParametrosNotificacaoInput } from "./types";

async function requireAdmin(): Promise<{ error: string | null; userId: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada, faça login novamente.", userId: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { error: "Apenas administradores podem alterar parâmetros.", userId: null };
  }

  return { error: null, userId: user.id };
}

export async function updateParametrosNotificacao(input: ParametrosNotificacaoInput) {
  const guard = await requireAdmin();
  if (guard.error) return { error: guard.error };

  for (const [label, value] of Object.entries(input)) {
    if (!Number.isInteger(value) || value <= 0) {
      return { error: `Informe um número inteiro maior que zero para "${label}".` };
    }
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("parametros_notificacao")
    .update({
      dias_lead_sem_movimentacao: input.diasLeadSemMovimentacao,
      dias_proposta_sem_movimentacao: input.diasPropostaSemMovimentacao,
      dias_empresa_sem_contato: input.diasEmpresaSemContato,
      dias_lead_sem_acao: input.diasLeadSemAcao,
      dias_proposta_sem_acao: input.diasPropostaSemAcao,
      updated_by: guard.userId,
    })
    .eq("id", 1);

  if (error) return { error: error.message };

  revalidatePath("/parametros");
  return { error: null };
}
