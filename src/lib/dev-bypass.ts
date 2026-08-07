/**
 * TEMPORÁRIO — ver BUG-005 em bugs.md.
 *
 * O login real via Supabase Auth está falhando em produção (Vercel) por um
 * motivo ainda não diagnosticado, apesar das env vars conferidas e das
 * credenciais funcionando direto contra a API do Supabase. Enquanto isso é
 * investigado, esta credencial fixa permite acessar o app sem depender do
 * Supabase Auth.
 *
 * REMOVER (este arquivo, o uso em src/app/login/page.tsx e em
 * src/lib/supabase/middleware.ts) assim que o BUG-005 for corrigido.
 */
export const DEV_BYPASS_COOKIE = "logihub_dev_bypass";
export const DEV_BYPASS_EMAIL = "teste@logihub.dev";
export const DEV_BYPASS_PASSWORD = "39LVvSqXCPdE";
