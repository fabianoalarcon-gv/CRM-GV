"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { InviteUsuarioInput, UpdateUsuarioInput } from "./types";

async function requireAdmin(): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada, faça login novamente." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { error: "Apenas administradores podem gerenciar usuários." };
  }

  return { error: null };
}

export async function inviteUsuario(input: InviteUsuarioInput) {
  const guard = await requireAdmin();
  if (guard.error) return { error: guard.error };

  const email = input.email.trim();
  const fullName = input.full_name.trim();
  if (!email) return { error: "Informe o e-mail." };
  if (!fullName) return { error: "Informe o nome." };
  if (input.password.length < 6) return { error: "A senha precisa ter pelo menos 6 caracteres." };

  const admin = createAdminClient();
  // Cadastro direto com senha provisória — sem envio de e-mail de convite,
  // já que o sistema não tem um serviço de e-mail configurado hoje. O
  // usuário é forçado a trocar essa senha no primeiro login (ver
  // must_change_password e src/app/login/page.tsx).
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error) return { error: error.message };

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      must_change_password: true,
      google_calendar_sync: input.google_calendar_sync,
      ...(input.role !== "comercial" ? { role: input.role } : {}),
    })
    .eq("id", data.user.id);
  if (profileError) return { error: profileError.message };

  revalidatePath("/usuarios");
  return { error: null };
}

export async function updateUsuario(id: string, input: UpdateUsuarioInput) {
  const guard = await requireAdmin();
  if (guard.error) return { error: guard.error };

  const fullName = input.full_name.trim();
  const email = input.email.trim();
  const password = input.password.trim();
  if (!fullName) return { error: "Informe o nome." };
  if (!email) return { error: "Informe o e-mail." };
  if (password && password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }

  const admin = createAdminClient();

  const { error: authError } = await admin.auth.admin.updateUserById(id, {
    email,
    email_confirm: true,
    ...(password ? { password } : {}),
  });
  if (authError) return { error: authError.message };

  // Trocar a senha por esse caminho marca ela como provisória de novo — o
  // usuário é forçado a trocá-la no próximo login, igual ao cadastro inicial.
  const { error } = await admin
    .from("profiles")
    .update({
      full_name: fullName,
      role: input.role,
      is_active: input.is_active,
      google_calendar_sync: input.google_calendar_sync,
      ...(password ? { must_change_password: true } : {}),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/usuarios");
  return { error: null };
}

export async function deleteUsuario(id: string) {
  const guard = await requireAdmin();
  if (guard.error) return { error: guard.error };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);

  if (error) return { error: error.message };

  revalidatePath("/usuarios");
  return { error: null };
}
