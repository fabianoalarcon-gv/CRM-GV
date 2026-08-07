import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEV_BYPASS_COOKIE } from "@/lib/dev-bypass";

/**
 * Renova a sessão do Supabase Auth a cada requisição e faz a guarda básica de
 * autenticação (usuário logado ou não). Bloqueio por perfil (RBAC) fica para
 * AUTH-05, quando a tabela de Perfis/Roles (DB-01) existir.
 *
 * TEMPORÁRIO — ver BUG-005 em bugs.md: também aceita o cookie de bypass
 * enquanto o login real via Supabase Auth não funciona em produção.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/login";
  const hasDevBypass = request.cookies.get(DEV_BYPASS_COOKIE)?.value === "1";
  const isAuthenticated = !!user || hasDevBypass;

  if (!isAuthenticated && !isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
