import { createAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@/lib/auth/types";
import type { Usuario } from "./types";

export async function getUsuarios(): Promise<Usuario[]> {
  const admin = createAdminClient();

  const [{ data: authData, error: authError }, { data: profiles, error: profilesError }] =
    await Promise.all([
      admin.auth.admin.listUsers(),
      admin
        .from("profiles")
        .select("id, full_name, role, is_active, google_calendar_sync, created_at"),
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
      created_at: p.created_at,
    }))
    .sort((a, b) => a.full_name.localeCompare(b.full_name));
}
