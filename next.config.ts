import type { NextConfig } from "next";

// Origem do projeto Supabase (lida do env, não hardcoded) — usada no
// connect-src da CSP abaixo, pra não precisar editar isso à mão se o
// projeto Supabase mudar.
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : "";

// 'unsafe-inline' em script-src/style-src é necessário aqui: o App Router do
// Next injeta script inline pra hidratação (sem infra de nonce configurada),
// e o app usa bastante style={{...}} inline (cor dinâmica de gráfico, largura
// de barra, etc.) — bloquear isso quebraria a aplicação. Ainda assim, a CSP
// segue útil contra os outros vetores: carregar script de outro domínio,
// enviar dado pra host inesperado (connect-src), ou embutir o app num iframe
// alheio (frame-ancestors).
// 'unsafe-eval' só em dev: o React usa eval() em modo desenvolvimento pra
// reconstruir stack traces do overlay de erro — nunca em produção (o próprio
// React avisa disso), então não faz sentido afrouxar a CSP de produção só
// por causa de uma feature de debug que não roda lá.
const scriptSrc =
  process.env.NODE_ENV === "production"
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  `connect-src 'self' ${supabaseOrigin}`.trim(),
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  // Remove o header "X-Powered-By: Next.js" das respostas — não vaza nada
  // crítico, mas facilita fingerprinting do framework/versão por quem for
  // procurar CVEs conhecidos.
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          // HSTS: força o navegador a só usar https nesse domínio daqui pra
          // frente — mitiga MITM que tente fazer downgrade pra http antes do
          // redirect da Vercel entrar em ação.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Não deixa o navegador "adivinhar" um content-type diferente do
          // declarado — evita um upload malicioso disfarçado ser executado
          // como script/html.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Redundante com frame-ancestors da CSP, mas mantém compatibilidade
          // com navegador mais antigo que não suporte CSP nível 2.
          { key: "X-Frame-Options", value: "DENY" },
          // Não manda a URL completa (com querystring) no header Referer ao
          // sair do domínio — só a origem.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Desliga APIs de navegador que o app não usa.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
