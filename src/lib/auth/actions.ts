"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { passwordMeetsAllRules } from "./passwordRules";

// Troca a senha provisória no primeiro login. A senha em si é atualizada
// pelo próprio client autenticado (o Supabase Auth já permite isso pra
// qualquer usuário logado); já a flag must_change_password em profiles só
// pode ser escrita por Admin via RLS — por isso o client de service role
// aqui, sempre restrito ao id do usuário já autenticado acima (nunca a
// outro registro).
export async function completePasswordSetup(newPassword: string) {
  if (!passwordMeetsAllRules(newPassword)) {
    return { error: "A senha não atende a todas as regras exigidas." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada, faça login novamente." };

  const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
  if (passwordError) return { error: passwordError.message };

  const admin = createAdminClient();
  const { error: flagError } = await admin
    .from("profiles")
    .update({ must_change_password: false })
    .eq("id", user.id);
  if (flagError) return { error: flagError.message };

  return { error: null };
}
