-- Log de auditoria das ações administrativas principais (usuários e
-- exclusões de Lead/Proposta/Empresa) — só leitura por Admin, gravação só
-- pelo client de service role (as próprias Server Actions já gated por
-- requireAdmin/RLS de admin). Retenção configurável em Parâmetros >
-- Auditoria, limpeza automática via /api/cron/limpar-logs-auditoria.

create table public.logs_auditoria (
  id bigint generated always as identity primary key,
  acao text not null,
  descricao text not null,
  autor_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index logs_auditoria_created_at_idx on public.logs_auditoria (created_at desc);

alter table public.logs_auditoria enable row level security;

create policy logs_auditoria_select on public.logs_auditoria
  for select to authenticated using ((select private.is_admin()));

-- Menu Parâmetros > seção "Auditoria": só o prazo de retenção dos logs.
-- Tabela singleton (id fixo em 1), mesmo padrão de parametros_email etc.
create table public.parametros_auditoria (
  id integer primary key default 1 check (id = 1),
  dias_retencao integer not null default 60 check (dias_retencao > 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id)
);

insert into public.parametros_auditoria (id) values (1);

create trigger parametros_auditoria_set_updated_at
  before update on public.parametros_auditoria
  for each row execute function public.set_updated_at();

alter table public.parametros_auditoria enable row level security;

-- Mesma convenção das outras tabelas de Parâmetros: RBAC 100% em código
-- (requireAdmin na Server Action), sem policy de insert/update/delete.
create policy parametros_auditoria_select on public.parametros_auditoria
  for select to authenticated using (true);
