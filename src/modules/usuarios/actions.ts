"use server";

import { revalidatePath } from "next/cache";
import { registrarLogAuditoria } from "@/lib/auditoria";
import { sendEmail } from "@/lib/email/send";
import { buildNovoUsuarioEmailBody } from "@/lib/email/templates";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { InviteUsuarioInput, UpdateUsuarioInput } from "./types";

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  comercial: "Comercial",
  operacoes: "Operações",
  financeiro: "Financeiro",
};

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
    return { error: "Apenas administradores podem gerenciar usuários.", userId: null };
  }

  return { error: null, userId: user.id };
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
  // Cadastro direto com senha provisória — o usuário é forçado a trocá-la no
  // primeiro login (ver must_change_password e src/app/login/page.tsx). O
  // e-mail de boas-vindas abaixo é a única vez que essa senha existe fora do
  // hash do Supabase, então precisa ser enviado agora, antes de sair de
  // escopo.
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
      email_notifications: input.email_notifications,
      ...(input.role !== "comercial" ? { role: input.role } : {}),
    })
    .eq("id", data.user.id);
  if (profileError) return { error: profileError.message };

  try {
    await sendEmail({
      to: [email],
      subject: "Bem-vindo ao LogiHub CRM",
      html: buildNovoUsuarioEmailBody({ nome: fullName, email, senha: input.password }),
      fromName: "LogiHub CRM",
    });
  } catch (err) {
    // Cadastro já foi concluído com sucesso — uma falha de SMTP não deve
    // desfazer o usuário criado, só fica registrada pra investigação manual.
    console.error("Falha ao enviar e-mail de boas-vindas", err);
  }

  await registrarLogAuditoria(admin, {
    acao: "usuario_convidado",
    descricao: `Convidou ${fullName} (${email}) como ${ROLE_LABEL[input.role] ?? input.role}.`,
    autorId: guard.userId,
  });

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

  // Guardado ANTES do update pra poder comparar e descrever no log de
  // auditoria só o que de fato mudou (papel, ativo/inativo).
  const { data: before } = await admin
    .from("profiles")
    .select("role, is_active")
    .eq("id", id)
    .maybeSingle();

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
      email_notifications: input.email_notifications,
      ...(password ? { must_change_password: true } : {}),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  const mudancas: string[] = [];
  if (before && before.role !== input.role) {
    mudancas.push(
      `papel de ${ROLE_LABEL[before.role] ?? before.role} para ${ROLE_LABEL[input.role] ?? input.role}`,
    );
  }
  if (before && before.is_active !== input.is_active) {
    mudancas.push(input.is_active ? "reativou a conta" : "desativou a conta");
  }
  if (password) mudancas.push("redefiniu a senha");

  if (mudancas.length > 0) {
    await registrarLogAuditoria(admin, {
      acao: "usuario_editado",
      descricao: `Editou ${fullName} (${email}): ${mudancas.join(", ")}.`,
      autorId: guard.userId,
    });
  }

  revalidatePath("/usuarios");
  return { error: null };
}

export async function deleteUsuario(id: string) {
  const guard = await requireAdmin();
  if (guard.error) return { error: guard.error };

  const admin = createAdminClient();

  // Guardado ANTES de excluir — depois do delete não tem mais como buscar
  // nome/e-mail pra descrever no log.
  const { data: before } = await admin.from("profiles").select("full_name").eq("id", id).maybeSingle();
  const {
    data: { user: authUser },
  } = await admin.auth.admin.getUserById(id);

  const { error } = await admin.auth.admin.deleteUser(id);

  if (error) return { error: error.message };

  await registrarLogAuditoria(admin, {
    acao: "usuario_excluido",
    descricao: `Excluiu o usuário ${before?.full_name ?? "—"} (${authUser?.email ?? "—"}).`,
    autorId: guard.userId,
  });

  revalidatePath("/usuarios");
  return { error: null };
}
