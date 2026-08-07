-- DB-03: Propostas (núcleo do Pipeline Comercial) + histórico de observações (PIPE-12).
-- Setor do cliente não é duplicado aqui — vem de clientes.setor via join.

create table public.propostas (
  id bigint generated always as identity primary key,
  numero_proposta text not null unique,
  data_envio date not null default current_date,
  cliente_id bigint not null references public.clientes (id),
  servico text,
  descricao text,
  valor numeric(12, 2) not null default 0,
  status_id bigint not null references public.proposal_statuses (id),
  termometro text not null default 'morno'
    check (termometro in ('frio', 'morno', 'quente')),
  tipo_servico text not null check (tipo_servico in ('fixo', 'spot')),
  responsavel_id uuid references public.profiles (id),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.propostas.numero_proposta is
  'Padrão NNN/AA, com sufixo opcional (ex: "028/25.1") — validado na aplicação (PIPE-10).';

create index propostas_cliente_id_idx on public.propostas (cliente_id);
create index propostas_status_id_idx on public.propostas (status_id);
create index propostas_responsavel_id_idx on public.propostas (responsavel_id);
create index propostas_created_by_idx on public.propostas (created_by);

create trigger propostas_set_updated_at
  before update on public.propostas
  for each row execute function public.set_updated_at();

create table public.propostas_historico (
  id bigint generated always as identity primary key,
  proposta_id bigint not null references public.propostas (id) on delete cascade,
  autor_id uuid references public.profiles (id),
  texto text not null,
  created_at timestamptz not null default now()
);

comment on table public.propostas_historico is
  'Log de observações da proposta, com data/autor (PIPE-12).';

create index propostas_historico_proposta_id_idx on public.propostas_historico (proposta_id);
