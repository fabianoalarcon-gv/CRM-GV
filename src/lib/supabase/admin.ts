import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Cliente com a service role key — ignora RLS. Uso restrito a código
// server-only (Server Actions/Components) que já validou que quem chamou é
// Admin (ver requireAdmin em src/modules/usuarios/actions.ts). Nunca importar
// a partir de um componente client.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
