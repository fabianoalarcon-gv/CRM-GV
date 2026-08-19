-- Menu Parâmetros (admin-only) > seção Notificações: limiares em dias usados
-- pela varredura diária de notificações de inatividade. Tabela singleton (id
-- fixo em 1, travado pelo CHECK) — não existe conceito de múltiplas
-- configurações, só a atual.

create table public.parametros_notificacao (
  id integer primary key default 1 check (id = 1),
  dias_lead_sem_movimentacao integer not null default 5 check (dias_lead_sem_movimentacao > 0),
  dias_proposta_sem_movimentacao integer not null default 5
    check (dias_proposta_sem_movimentacao > 0),
  dias_empresa_sem_contato integer not null default 5 check (dias_empresa_sem_contato > 0),
  dias_lead_sem_acao integer not null default 5 check (dias_lead_sem_acao > 0),
  dias_proposta_sem_acao integer not null default 5 check (dias_proposta_sem_acao > 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id)
);

insert into public.parametros_notificacao (id) values (1);

create trigger parametros_notificacao_set_updated_at
  before update on public.parametros_notificacao
  for each row execute function public.set_updated_at();

alter table public.parametros_notificacao enable row level security;

-- Leitura liberada a qualquer autenticado (não é dado sensível). Sem policy
-- de insert/update/delete — mesma convenção de /usuarios: RBAC 100% em
-- código (requireAdmin na Server Action), não em RLS.
create policy parametros_notificacao_select on public.parametros_notificacao
  for select to authenticated using (true);
