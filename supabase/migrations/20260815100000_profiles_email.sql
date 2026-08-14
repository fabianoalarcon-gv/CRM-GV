-- Copia o e-mail de auth.users pra profiles, assim páginas comuns (não só a
-- de administração de Usuários) podem exibir "criado por" com e-mail sem
-- precisar do client de service role — que é restrito a fluxos já validados
-- como Admin (ver comentário em src/lib/supabase/admin.ts).

alter table public.profiles add column email text;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id;

alter table public.profiles alter column email set not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    'comercial'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
