-- DB-05: Compromissos do Calendário — vinculados a Usuários (quem criou) e,
-- opcionalmente, a um Cliente. Visualização é compartilhada entre todos (CAL-04),
-- então não há RLS por dono aqui (ver migration de RLS).

create table public.compromissos (
  id bigint generated always as identity primary key,
  titulo text not null,
  descricao text,
  inicio timestamptz not null,
  fim timestamptz,
  cliente_id bigint references public.clientes (id) on delete set null,
  criado_por uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index compromissos_criado_por_idx on public.compromissos (criado_por);
create index compromissos_inicio_idx on public.compromissos (inicio);
create index compromissos_cliente_id_idx on public.compromissos (cliente_id);

create trigger compromissos_set_updated_at
  before update on public.compromissos
  for each row execute function public.set_updated_at();
