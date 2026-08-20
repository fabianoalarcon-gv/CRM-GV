-- Termômetro deixa de ser obrigatório nos cards de Lead (Prospecção,
-- Qualificação, Arquivado) — o usuário pode selecionar um ou deixar sem
-- nenhum. Como Lead e Proposta compartilham a mesma linha de `propostas`
-- (um Lead promovido vira Proposta sem duplicar registro), a coluna
-- passa a aceitar NULL de forma geral; o formulário do Pipeline continua
-- sempre enviando um valor ao criar/editar uma Proposta diretamente.

alter table public.propostas alter column termometro drop not null;
alter table public.propostas alter column termometro drop default;

alter table public.propostas drop constraint if exists propostas_termometro_check;
alter table public.propostas add constraint propostas_termometro_check
  check (termometro is null or termometro in ('frio', 'morno', 'quente'));
