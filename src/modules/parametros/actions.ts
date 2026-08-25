"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ACAO_TIPO_OPTIONS } from "@/modules/calendario/utils";
import { NOTIFICACAO_TIPO_OPTIONS } from "@/modules/notificacoes/utils";
import type {
  ParametrosAuditoriaInput,
  ParametrosEmailInput,
  ParametrosGoogleCalendarInput,
  ParametrosNotificacaoInput,
  ParametrosRetomadaLeadInput,
} from "./types";

const CATEGORIA_VALIDA = new Set(ACAO_TIPO_OPTIONS.map((o) => o.value));
const NOTIFICACAO_TIPO_VALIDA = new Set(NOTIFICACAO_TIPO_OPTIONS.map((o) => o.value));

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

export async function updateParametrosEmail(input: ParametrosEmailInput) {
  const guard = await requireAdmin();
  if (guard.error) return { error: guard.error };

  if (input.modoTeste && !input.emailTeste?.trim()) {
    return { error: "Informe o e-mail de teste enquanto o modo teste estiver ativo." };
  }
  if (!input.nomeRemetente.trim()) {
    return { error: "Informe o nome do remetente." };
  }
  for (const tipo of input.tiposHabilitados) {
    if (!NOTIFICACAO_TIPO_VALIDA.has(tipo)) {
      return { error: `Tipo de notificação inválido: ${tipo}.` };
    }
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("parametros_email")
    .update({
      ativo: input.ativo,
      nome_remetente: input.nomeRemetente.trim(),
      modo_teste: input.modoTeste,
      email_teste: input.emailTeste?.trim() || null,
      tipos_habilitados: input.tiposHabilitados,
      updated_by: guard.userId,
    })
    .eq("id", 1);

  if (error) return { error: error.message };

  revalidatePath("/parametros");
  return { error: null };
}

export async function updateParametrosGoogleCalendar(input: ParametrosGoogleCalendarInput) {
  const guard = await requireAdmin();
  if (guard.error) return { error: guard.error };

  const admin = createAdminClient();
  const { error } = await admin
    .from("parametros_google_calendar")
    .update({ ativo: input.ativo, updated_by: guard.userId })
    .eq("id", 1);

  if (error) return { error: error.message };

  revalidatePath("/parametros");
  return { error: null };
}

export async function updateParametrosRetomadaLead(input: ParametrosRetomadaLeadInput) {
  const guard = await requireAdmin();
  if (guard.error) return { error: guard.error };

  if (!Number.isInteger(input.dias) || input.dias <= 0) {
    return { error: "Informe um número inteiro maior que zero para os dias." };
  }
  if (!CATEGORIA_VALIDA.has(input.categoria)) {
    return { error: "Selecione uma categoria de ação válida." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("parametros_retomada_lead_arquivado")
    .update({
      dias: input.dias,
      categoria: input.categoria,
      updated_by: guard.userId,
    })
    .eq("id", 1);

  if (error) return { error: error.message };

  revalidatePath("/parametros");
  return { error: null };
}

export async function updateParametrosAuditoria(input: ParametrosAuditoriaInput) {
  const guard = await requireAdmin();
  if (guard.error) return { error: guard.error };

  if (!Number.isInteger(input.diasRetencao) || input.diasRetencao <= 0) {
    return { error: "Informe um número inteiro maior que zero para os dias." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("parametros_auditoria")
    .update({ dias_retencao: input.diasRetencao, updated_by: guard.userId })
    .eq("id", 1);

  if (error) return { error: error.message };

  revalidatePath("/parametros");
  return { error: null };
}
