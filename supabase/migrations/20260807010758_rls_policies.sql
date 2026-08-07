-- DB-08: Row Level Security.
-- Modelo de permissão (Projeto_LogiHub_CRM.md, seção 4): Admin e Comercial
-- veem e editam tudo (propostas, clientes, dashboards) — não há isolamento por
-- dono de linha. RLS aqui serve para: (1) exigir usuário autenticado sempre,
-- (2) restringir administração de usuários e exclusões a Admin.

create schema if not exists private;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke execute on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

-- profiles: todo mundo lê (precisa exibir nomes), só Admin escreve.
-- (a criação automática via trigger on_auth_user_created roda como
-- security definer e não passa por RLS.)
alter table public.profiles enable row level security;

create policy profiles_select on public.profiles
  for select to authenticated using (true);
create policy profiles_insert on public.profiles
  for insert to authenticated with check ((select private.is_admin()));
create policy profiles_update on public.profiles
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));
create policy profiles_delete on public.profiles
  for delete to authenticated using ((select private.is_admin()));

-- proposal_statuses: todo mundo lê; só Admin cria/edita/remove colunas do Kanban.
alter table public.proposal_statuses enable row level security;

create policy proposal_statuses_select on public.proposal_statuses
  for select to authenticated using (true);
create policy proposal_statuses_insert on public.proposal_statuses
  for insert to authenticated with check ((select private.is_admin()));
create policy proposal_statuses_update on public.proposal_statuses
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));
create policy proposal_statuses_delete on public.proposal_statuses
  for delete to authenticated using ((select private.is_admin()));

-- clientes: Admin e Comercial podem ler/criar/editar; só Admin remove.
alter table public.clientes enable row level security;

create policy clientes_select on public.clientes
  for select to authenticated using (true);
create policy clientes_insert on public.clientes
  for insert to authenticated with check (true);
create policy clientes_update on public.clientes
  for update to authenticated using (true) with check (true);
create policy clientes_delete on public.clientes
  for delete to authenticated using ((select private.is_admin()));

-- contatos_cliente: mesma regra de clientes.
alter table public.contatos_cliente enable row level security;

create policy contatos_cliente_select on public.contatos_cliente
  for select to authenticated using (true);
create policy contatos_cliente_insert on public.contatos_cliente
  for insert to authenticated with check (true);
create policy contatos_cliente_update on public.contatos_cliente
  for update to authenticated using (true) with check (true);
create policy contatos_cliente_delete on public.contatos_cliente
  for delete to authenticated using ((select private.is_admin()));

-- propostas: Admin e Comercial veem e editam tudo; só Admin remove.
alter table public.propostas enable row level security;

create policy propostas_select on public.propostas
  for select to authenticated using (true);
create policy propostas_insert on public.propostas
  for insert to authenticated with check (true);
create policy propostas_update on public.propostas
  for update to authenticated using (true) with check (true);
create policy propostas_delete on public.propostas
  for delete to authenticated using ((select private.is_admin()));

-- propostas_historico: log — todo mundo lê/insere, ninguém edita/remove (imutável).
alter table public.propostas_historico enable row level security;

create policy propostas_historico_select on public.propostas_historico
  for select to authenticated using (true);
create policy propostas_historico_insert on public.propostas_historico
  for insert to authenticated with check (true);

-- interacoes_cliente: mesma lógica de log imutável.
alter table public.interacoes_cliente enable row level security;

create policy interacoes_cliente_select on public.interacoes_cliente
  for select to authenticated using (true);
create policy interacoes_cliente_insert on public.interacoes_cliente
  for insert to authenticated with check (true);

-- compromissos: agenda compartilhada (CAL-04) — Admin e Comercial veem/editam tudo.
alter table public.compromissos enable row level security;

create policy compromissos_select on public.compromissos
  for select to authenticated using (true);
create policy compromissos_insert on public.compromissos
  for insert to authenticated with check (true);
create policy compromissos_update on public.compromissos
  for update to authenticated using (true) with check (true);
create policy compromissos_delete on public.compromissos
  for delete to authenticated using (true);
