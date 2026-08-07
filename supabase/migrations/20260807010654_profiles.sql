-- DB-01: Usuários/Perfis (RBAC)
-- profiles é 1-para-1 com auth.users (padrão Supabase): o Auth cuida de
-- login/senha, esta tabela guarda dados de negócio (nome, perfil/role).

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role text not null default 'comercial'
    check (role in ('admin', 'comercial', 'operacoes', 'financeiro')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Dados de negócio dos usuários (nome, perfil/role). Login/senha ficam em auth.users.';
comment on column public.profiles.role is
  'admin e comercial em uso; operacoes e financeiro reservados para fases futuras.';

-- Mantém updated_at em dia em qualquer UPDATE; reaproveitada pelas próximas migrations.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Cria a linha em profiles automaticamente quando um usuário se cadastra no Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    'comercial'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: o usuário de teste (BUG-005/scripts/create-test-user.mjs) foi criado
-- antes desta migration existir, então não passou pelo trigger acima.
insert into public.profiles (id, full_name, role)
select id, coalesce(raw_user_meta_data ->> 'full_name', email), 'admin'
from auth.users
where email = 'teste@logihub.dev'
on conflict (id) do nothing;
