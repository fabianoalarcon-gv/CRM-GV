-- DB-02: Clientes/Empresas + contatos (uma empresa pode ter vários contatos).

create table public.clientes (
  id bigint generated always as identity primary key,
  nome text not null,
  setor text,
  endereco text,
  observacoes text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clientes_created_by_idx on public.clientes (created_by);
create index clientes_setor_idx on public.clientes (setor);

create trigger clientes_set_updated_at
  before update on public.clientes
  for each row execute function public.set_updated_at();

create table public.contatos_cliente (
  id bigint generated always as identity primary key,
  cliente_id bigint not null references public.clientes (id) on delete cascade,
  nome text not null,
  cargo text,
  email text,
  telefone text,
  created_at timestamptz not null default now()
);

create index contatos_cliente_cliente_id_idx on public.contatos_cliente (cliente_id);
