import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rotas acessíveis sem sessão — telas do fluxo de autenticação (AUTH-03).
const PUBLIC_ROUTES = ["/login", "/esqueci-senha", "/redefinir-senha"];

/**
 * Renova a sessão do Supabase Auth a cada requisição e faz a guarda básica de
 * autenticação (usuário logado ou não), além de bloquear usuários desativados
 * (profiles.is_active = false, ver AUTH-06). RBAC por perfil fica no frontend
 * (AUTH-05) e nas policies de RLS.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Secure só em produção (Vercel, sempre https) — em dev (http://localhost)
      // o navegador recusa gravar um cookie Secure, o que quebraria o login local.
      cookieOptions: { secure: process.env.NODE_ENV === "production" },
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
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_active, must_change_password")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.is_active === false) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("inativo", "1");
      return NextResponse.redirect(url);
    }

    // Com senha provisória pendente, o usuário fica preso em /login (onde o
    // modal obrigatório de troca aparece) até trocar a senha — sem isso, o
    // redirect padrão de "autenticado em /login vai pra /" abaixo também
    // interceptaria a própria requisição da Server Action do modal.
    if (profile?.must_change_password) {
      if (pathname !== "/login") {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
      }
      return supabaseResponse;
    }

    if (pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
