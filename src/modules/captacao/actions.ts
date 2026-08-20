"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCaptacao(empresaId: number): Promise<{ error: string | null }> {
  if (!empresaId) return { error: "Selecione a empresa." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("captacoes")
    .insert({ empresa_id: empresaId, created_by: user?.id ?? null });

  if (error) return { error: error.message };

  revalidatePath("/captacao");
  return { error: null };
}

export async function deleteCaptacao(captacaoId: number): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("captacoes").delete().eq("id", captacaoId);

  if (error) return { error: error.message };

  revalidatePath("/captacao");
  return { error: null };
}

// Cria um Lead (linha em `propostas`, estágio Prospecção) herdando a
// empresa da captação, e remove o registro de Captação em seguida — mesmo
// padrão de "promover" já usado em outras conversões de estágio do projeto.
export async function transformarCaptacaoEmLead(
  captacaoId: number,
  empresaId: number,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: status, error: statusError } = await supabase
    .from("proposal_statuses")
    .select("id")
    .eq("key", "prospeccao")
    .single();

  if (statusError || !status) {
    return { error: "Não foi possível localizar o status inicial (Prospecção) dos Leads." };
  }

  const { error: insertError } = await supabase.from("propostas").insert({
    empresa_id: empresaId,
    data_inicio_lead: new Date().toISOString().slice(0, 10),
    status_id: status.id,
    created_by: user?.id ?? null,
  });

  if (insertError) return { error: insertError.message };

  const { error: deleteError } = await supabase.from("captacoes").delete().eq("id", captacaoId);
  if (deleteError) return { error: deleteError.message };

  revalidatePath("/captacao");
  revalidatePath("/leads");
  revalidatePath("/pipeline");
  return { error: null };
}
