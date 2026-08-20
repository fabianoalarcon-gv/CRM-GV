import { createClient } from "@/lib/supabase/server";
import type { CompromissoTipo } from "@/modules/calendario/types";
import type { ParametrosNotificacao, ParametrosRetomadaLead } from "./types";

export async function getParametrosNotificacao(): Promise<ParametrosNotificacao> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("parametros_notificacao")
    .select(
      "dias_lead_sem_movimentacao, dias_proposta_sem_movimentacao, dias_empresa_sem_contato, dias_lead_sem_acao, dias_proposta_sem_acao",
    )
    .eq("id", 1)
    .single();

  if (error) throw error;

  return {
    diasLeadSemMovimentacao: data.dias_lead_sem_movimentacao,
    diasPropostaSemMovimentacao: data.dias_proposta_sem_movimentacao,
    diasEmpresaSemContato: data.dias_empresa_sem_contato,
    diasLeadSemAcao: data.dias_lead_sem_acao,
    diasPropostaSemAcao: data.dias_proposta_sem_acao,
  };
}

export async function getParametrosRetomadaLead(): Promise<ParametrosRetomadaLead> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("parametros_retomada_lead_arquivado")
    .select("dias, categoria")
    .eq("id", 1)
    .single();

  if (error) throw error;

  return {
    dias: data.dias,
    categoria: data.categoria as CompromissoTipo,
  };
}
