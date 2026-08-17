"use server";

import { createClient } from "@/lib/supabase/server";
import type { Notificacao, NotificacaoTipo } from "./types";

export async function getUnreadNotifications(): Promise<Notificacao[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_unread_notificacoes");

  if (error || !data) return [];

  return data.map((n) => ({
    id: n.id,
    tipo: n.tipo as NotificacaoTipo,
    mensagem: n.mensagem,
    empresaId: n.empresa_id,
    propostaId: n.proposta_id,
    compromissoId: n.compromisso_id,
    createdAt: n.created_at,
  }));
}

export async function markNotificationsAsRead(ids: number[]): Promise<{ error: string | null }> {
  if (ids.length === 0) return { error: null };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada, faça login novamente." };

  const rows = ids.map((notificacaoId) => ({ notificacao_id: notificacaoId, user_id: user.id }));
  const { error } = await supabase
    .from("notificacoes_lidas")
    .upsert(rows, { onConflict: "notificacao_id,user_id", ignoreDuplicates: true });

  if (error) return { error: error.message };
  return { error: null };
}
