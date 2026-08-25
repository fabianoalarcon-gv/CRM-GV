import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/profile";
import type { Role } from "@/lib/auth/types";
import type { Usuario } from "./types";

// Usa o client de service role (bypassa RLS) pra cruzar auth.users (e-mail)
// com profiles — por isso a checagem de Admin fica aqui dentro, não só na
// página que hoje é a única a chamar essa function. Sem isso, um futuro
// caller que esquecesse de checar o role antes exporia e-mail/role de todo
// mundo sem querer.
export async function getUsuarios(): Promise<Usuario[]> {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "admin") {
    throw new Error("Apenas administradores podem listar usuários.");
  }

  const admin = createAdminClient();

  const [{ data: authData, error: authError }, { data: profiles, error: profilesError }] =
    await Promise.all([
      admin.auth.admin.listUsers(),
      admin
        .from("profiles")
        .select(
          "id, full_name, role, is_active, google_calendar_sync, email_notifications, created_at",
        ),
    ]);

  if (authError) throw authError;
  if (profilesError) throw profilesError;

  const emailById = new Map(authData.users.map((u) => [u.id, u.email ?? "—"]));

  return (profiles ?? [])
    .map((p) => ({
      id: p.id,
      email: emailById.get(p.id) ?? "—",
      full_name: p.full_name,
      role: p.role as Role,
      is_active: p.is_active,
      google_calendar_sync: p.google_calendar_sync,
      email_notifications: p.email_notifications,
      created_at: p.created_at,
    }))
    .sort((a, b) => a.full_name.localeCompare(b.full_name));
}
