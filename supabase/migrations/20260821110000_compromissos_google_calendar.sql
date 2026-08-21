-- Sincronização de Ações do calendário do CRM com o Google Calendar do
-- usuário responsável (Service Account com delegação em todo o domínio do
-- Workspace granvale.com.br — ver GOOGLE_SERVICE_ACCOUNT_EMAIL /
-- GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY). Guarda o id do evento correspondente
-- no Google pra permitir atualizar/excluir depois, quando a Ação é editada
-- ou removida no CRM.

alter table public.compromissos add column google_event_id text;

-- Menu Parâmetros > seção "Google Calendar": liga/desliga a sincronização
-- sem precisar mexer em código. Mesmo padrão singleton das outras tabelas de
-- Parâmetros.
create table public.parametros_google_calendar (
  id integer primary key default 1 check (id = 1),
  ativo boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id)
);

insert into public.parametros_google_calendar (id) values (1);

create trigger parametros_google_calendar_set_updated_at
  before update on public.parametros_google_calendar
  for each row execute function public.set_updated_at();

alter table public.parametros_google_calendar enable row level security;

-- Mesma convenção das outras tabelas de Parâmetros: RBAC 100% em código
-- (requireAdmin na Server Action), sem policy de insert/update/delete.
create policy parametros_google_calendar_select on public.parametros_google_calendar
  for select to authenticated using (true);
