import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Secure só em produção (Vercel, sempre https) — em dev (http://localhost)
      // o navegador recusa gravar um cookie Secure, o que quebraria o login local.
      cookieOptions: { secure: process.env.NODE_ENV === "production" },
    },
  );
}
