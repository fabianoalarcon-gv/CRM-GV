-- Suporte às notificações de "aging" (inatividade) geradas pela varredura
-- diária (ver gerar_notificacoes_diarias, próxima migration): 5 novos tipos
-- de notificação + o mecanismo pra gerar no máximo 1 notificação por
-- entidade por dia, mesmo que a rotina rode mais de uma vez no mesmo dia
-- (cron com retry, reexecução manual em QA).

-- Dia de referência (America/Sao_Paulo) — usado só pelos 5 tipos de aging;
-- NULL nos demais tipos (reativos, disparados por trigger, sem noção de
-- "dia" — um insert/update acontece num instante, não num dia de referência).
alter table public.notificacoes add column evento_dia date;

-- coalesce(-1) porque um índice único trata NULL = NULL como valores
-- distintos — sem isso, duas notificações de empresa_sem_contato (que não
-- têm proposta_id) no mesmo dia não seriam pegas como duplicata.
create unique index notificacoes_aging_unicidade_idx
  on public.notificacoes (tipo, coalesce(proposta_id, -1), coalesce(empresa_id, -1), evento_dia)
  where evento_dia is not null;

alter table public.notificacoes drop constraint notificacoes_tipo_check;
alter table public.notificacoes add constraint notificacoes_tipo_check check (tipo in (
  'nova_empresa', 'novo_lead', 'nova_proposta', 'movimentacao_card',
  'proposta_aprovada', 'proposta_reprovada', 'nova_acao',
  'lead_sem_movimentacao', 'proposta_sem_movimentacao', 'empresa_sem_contato',
  'lead_sem_acao', 'proposta_sem_acao'
));
