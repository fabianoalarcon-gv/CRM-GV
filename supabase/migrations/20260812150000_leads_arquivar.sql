-- Arquivar Lead: nova coluna "Arquivado" no funil de Leads, entre
-- Qualificação e Proposta, e rastreio do status anterior pra permitir
-- reativar de volta pro mesmo estágio (Prospecção ou Qualificação).

update public.proposal_statuses set sort_order = sort_order + 1
  where key in ('proposta', 'negociacao', 'fechado');

insert into public.proposal_statuses (key, label, sort_order, is_default) values
  ('arquivado', 'Arquivado', 3, false);

alter table public.propostas
  add column status_anterior_id bigint references public.proposal_statuses (id) on delete set null;

comment on column public.propostas.status_anterior_id is
  'Status antes de arquivar (Prospecção/Qualificação) — usado pra reativar de volta pro mesmo estágio.';
