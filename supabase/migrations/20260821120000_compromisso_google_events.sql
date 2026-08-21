-- Correção de escopo da migration anterior (20260821110000): a sincronização
-- não é "1 evento na agenda de quem criou a Ação" — é "1 evento por AGENDA",
-- criado simultaneamente em todas: uma por usuário ativo do CRM, mais
-- crm@granvale.com.br. Cada agenda tem seu próprio id de evento no Google,
-- então uma única coluna em compromissos não é suficiente.

alter table public.compromissos drop column google_event_id;

create table public.compromisso_google_events (
  compromisso_id bigint not null references public.compromissos (id) on delete cascade,
  email text not null,
  google_event_id text not null,
  created_at timestamptz not null default now(),
  primary key (compromisso_id, email)
);

alter table public.compromisso_google_events enable row level security;

-- Mesma convenção de compromissos: agenda compartilhada, qualquer
-- autenticado lê/escreve (RBAC 100% em código quando aplicável).
create policy compromisso_google_events_select on public.compromisso_google_events
  for select to authenticated using (true);
create policy compromisso_google_events_insert on public.compromisso_google_events
  for insert to authenticated with check (true);
create policy compromisso_google_events_update on public.compromisso_google_events
  for update to authenticated using (true) with check (true);
create policy compromisso_google_events_delete on public.compromisso_google_events
  for delete to authenticated using (true);
