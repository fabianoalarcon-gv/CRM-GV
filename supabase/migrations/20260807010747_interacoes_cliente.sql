-- DB-04: Histórico de interações com o cliente (reuniões, ligações, follow-ups).

create table public.interacoes_cliente (
  id bigint generated always as identity primary key,
  cliente_id bigint not null references public.clientes (id) on delete cascade,
  autor_id uuid references public.profiles (id),
  tipo text,
  descricao text not null,
  data_interacao timestamptz not null default now(),
  created_at timestamptz not null default now()
);

comment on column public.interacoes_cliente.tipo is
  'Livre (ex: reuniao, ligacao, email, follow_up) — sem lista fechada por enquanto.';

create index interacoes_cliente_cliente_id_idx on public.interacoes_cliente (cliente_id);
create index interacoes_cliente_autor_id_idx on public.interacoes_cliente (autor_id);
