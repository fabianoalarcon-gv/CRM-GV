-- Corrige achados do `supabase db advisors --type security`:
-- 1) search_path mutável em set_updated_at (0011_function_search_path_mutable)
-- 2) handle_new_user exposto como RPC pública via PostgREST (0028/0029) — só o
--    trigger em auth.users deve chamá-la, não anon/authenticated via API.
-- (rls_auto_enable é gerenciada pela própria plataforma Supabase, não é nossa.)

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
