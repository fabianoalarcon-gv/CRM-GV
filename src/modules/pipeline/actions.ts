"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProposalStatus(proposalId: number, statusId: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("propostas")
    .update({ status_id: statusId })
    .eq("id", proposalId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/pipeline");
  return { error: null };
}
