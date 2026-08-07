-- Pipeline: expande de 3 pra 5 estágios (Prospecção > Qualificação > Proposta >
-- Negociação > Fechado). "Fechado" substitui Aprovado/Reprovado como coluna do
-- Kanban; o resultado (aprovado/reprovado) passa a ser um campo próprio em
-- `propostas`, preenchido só quando a proposta chega em "Fechado".

alter table public.propostas
  add column resultado text
    check (resultado in ('aprovado', 'reprovado') or resultado is null);

comment on column public.propostas.resultado is
  'Preenchido só quando a proposta chega no estágio "fechado" (aprovado/reprovado). Null enquanto ainda não foi decidido.';

-- Migra o resultado das propostas que já estavam decididas pelos status antigos.
update public.propostas
  set resultado = 'aprovado'
  where status_id = (select id from public.proposal_statuses where key = 'aprovado');

update public.propostas
  set resultado = 'reprovado'
  where status_id = (select id from public.proposal_statuses where key = 'reprovado');

-- Reaponta as propostas de "reprovado" pra "aprovado" antes de apagar a linha de
-- "reprovado" — as duas colunas antigas virão a se tornar uma coluna só ("fechado").
update public.propostas
  set status_id = (select id from public.proposal_statuses where key = 'aprovado')
  where status_id = (select id from public.proposal_statuses where key = 'reprovado');

delete from public.proposal_statuses where key = 'reprovado';

-- Reaproveita as linhas restantes (mesmo id, só troca rótulo/posição): nenhuma
-- proposta muda de linha nesta etapa. "em_analise" (proposta enviada, sendo
-- avaliada pelo cliente) mapeia melhor pro estágio "Proposta"; "aprovado" vira
-- "Fechado".
update public.proposal_statuses
  set key = 'proposta', label = 'Proposta', sort_order = 3, is_default = false
  where key = 'em_analise';

update public.proposal_statuses
  set key = 'fechado', label = 'Fechado', sort_order = 5
  where key = 'aprovado';

-- Novos estágios do início/meio do funil.
insert into public.proposal_statuses (key, label, sort_order, is_default) values
  ('prospeccao', 'Prospecção', 1, true),
  ('qualificacao', 'Qualificação', 2, false),
  ('negociacao', 'Negociação', 4, false);
