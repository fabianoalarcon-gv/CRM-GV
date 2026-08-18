-- Motivo da reprovação (PIPE): capturado no formulário quando Resultado =
-- Reprovado. Obrigatório só na aplicação (mesmo padrão de
-- isValidNumeroProposta) — não como CHECK, pra não quebrar a migration em
-- cima de propostas já reprovadas sem motivo.

alter table public.propostas
  add column motivo_reprovacao text;

comment on column public.propostas.motivo_reprovacao is
  'Motivo informado quando resultado = reprovado. Obrigatório na aplicação, não travado por CHECK no banco.';
