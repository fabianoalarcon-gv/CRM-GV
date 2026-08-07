import { createClient } from "@/lib/supabase/server";
import type { CurrentUser, Role } from "./types";

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();
  if (!profile) return null;

  return { id: user.id, fullName: profile.full_name, role: profile.role as Role };
}
