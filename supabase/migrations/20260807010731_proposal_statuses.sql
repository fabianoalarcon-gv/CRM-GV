-- DB-01/PIPE-13: colunas do Kanban como tabela (não enum fixo), para permitir
-- adicionar novos status no futuro sem migration (só um INSERT).

create table public.proposal_statuses (
  id bigint generated always as identity primary key,
  key text not null unique,
  label text not null,
  color text,
  sort_order integer not null default 0,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.proposal_statuses is
  'Colunas do Kanban de propostas. Extensível: novas colunas = novas linhas.';

insert into public.proposal_statuses (key, label, sort_order, is_default) values
  ('em_analise', 'Em análise', 1, true),
  ('aprovado', 'Aprovado', 2, false),
  ('reprovado', 'Reprovado', 3, false);
