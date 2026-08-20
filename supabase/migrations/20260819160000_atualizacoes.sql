-- Menu Atualizações (admin-only): cadastro de patch notes do sistema. Cada
-- atualização (patch) agrupa um ou mais itens (chamados/mudanças). O ícone
-- de atualizações no header (ao lado do sino de notificações) sinaliza
-- quando existe atualização ainda não vista pelo usuário logado — mesmo
-- padrão de leitura por usuário usado em notificacoes/notificacoes_lidas.

create table public.atualizacoes (
  id bigint generated always as identity primary key,
  numero_patch text not null,
  data_hora timestamptz not null,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index atualizacoes_data_hora_idx on public.atualizacoes (data_hora desc);

create table public.atualizacoes_itens (
  id bigint generated always as identity primary key,
  atualizacao_id bigint not null references public.atualizacoes (id) on delete cascade,
  numero_chamado text,
  tipo text not null check (tipo in ('solicitacao', 'correcao', 'melhoria', 'inclusao')),
  local text not null,
  descricao text not null,
  created_at timestamptz not null default now()
);

create index atualizacoes_itens_atualizacao_id_idx on public.atualizacoes_itens (atualizacao_id);

create table public.atualizacoes_vistas (
  atualizacao_id bigint not null references public.atualizacoes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  vista_em timestamptz not null default now(),
  primary key (atualizacao_id, user_id)
);

comment on table public.atualizacoes_vistas is
  'Marca de visualização por usuário do ícone de Atualizações no header — mesmo padrão de notificacoes_lidas.';

-- PK já cobre lookups por atualizacao_id (coluna líder); user_id sozinho
-- (usado pela policy de select abaixo) precisa do próprio índice.
create index atualizacoes_vistas_user_id_idx on public.atualizacoes_vistas (user_id);

alter table public.atualizacoes enable row level security;
alter table public.atualizacoes_itens enable row level security;
alter table public.atualizacoes_vistas enable row level security;

-- Leitura liberada a qualquer autenticado. Sem policy de insert/update/delete
-- em atualizacoes/atualizacoes_itens — mesma convenção de /usuarios e
-- /parametros: RBAC 100% em código (requireAdmin nas Server Actions, que
-- gravam via createAdminClient).
create policy atualizacoes_select on public.atualizacoes
  for select to authenticated using (true);
create policy atualizacoes_itens_select on public.atualizacoes_itens
  for select to authenticated using (true);

create policy atualizacoes_vistas_select on public.atualizacoes_vistas
  for select to authenticated using (user_id = (select auth.uid()));
create policy atualizacoes_vistas_insert on public.atualizacoes_vistas
  for insert to authenticated with check (user_id = (select auth.uid()));

-- RPC: ids das atualizações que o usuário logado ainda não viu (anti-join
-- simples, mesmo padrão de get_unread_notificacoes).
create or replace function public.get_unseen_atualizacoes_ids()
returns setof bigint
language sql
stable
security invoker
set search_path = ''
as $$
  select a.id
  from public.atualizacoes a
  where not exists (
    select 1 from public.atualizacoes_vistas v
    where v.atualizacao_id = a.id and v.user_id = (select auth.uid())
  );
$$;

revoke execute on function public.get_unseen_atualizacoes_ids() from public, anon;
grant execute on function public.get_unseen_atualizacoes_ids() to authenticated;
