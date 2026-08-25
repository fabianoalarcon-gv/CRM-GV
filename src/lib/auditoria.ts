import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/database.types";

export interface LogAuditoriaInput {
  acao: string;
  descricao: string;
  autorId: string | null;
}

// Grava no log de auditoria (ver Parâmetros > Auditoria) — chamado a partir
// das próprias Server Actions administrativas, sempre com o client de
// service role que elas já têm em mãos. Falha de log nunca deve derrubar a
// ação principal (ex: usuário foi excluído com sucesso mas o log falhou por
// algum motivo) — por isso só registra o erro no console, não propaga.
export async function registrarLogAuditoria(
  admin: SupabaseClient<Database>,
  input: LogAuditoriaInput,
): Promise<void> {
  const { error } = await admin.from("logs_auditoria").insert({
    acao: input.acao,
    descricao: input.descricao,
    autor_id: input.autorId,
  });
  if (error) console.error("Falha ao gravar log de auditoria", error);
}
