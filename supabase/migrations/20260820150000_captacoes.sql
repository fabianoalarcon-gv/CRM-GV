-- Menu Captação: registro de empresas recém-cadastradas que ainda não
-- viraram Lead. Criado automaticamente (opcional) logo após o cadastro de
-- uma nova Empresa, ou manualmente via botão "Nova Captação". Ao ser
-- transformada em Lead, a linha é removida daqui (a informação passa a
-- viver em `propostas`).

create table public.captacoes (
  id bigint generated always as identity primary key,
  empresa_id bigint not null references public.empresas (id) on delete cascade,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index captacoes_empresa_id_idx on public.captacoes (empresa_id);

alter table public.captacoes enable row level security;

-- Mesmo padrão de `compromissos` (agenda compartilhada): qualquer usuário
-- autenticado pode ler, criar e excluir — não é uma tela de administração.
create policy captacoes_select on public.captacoes
  for select to authenticated using (true);
create policy captacoes_insert on public.captacoes
  for insert to authenticated with check (true);
create policy captacoes_delete on public.captacoes
  for delete to authenticated using (true);
