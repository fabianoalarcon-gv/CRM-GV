-- Categoria do compromisso (Calendário redesign): mesmo padrão de
-- interacoes_cliente.tipo — texto livre, sem lista fechada no banco, validado
-- na aplicação (formulário usa um select fixo).
alter table public.compromissos
  add column tipo text;

comment on column public.compromissos.tipo is
  'Livre (ex: fretes, reuniao, urgente, embarque, outro) — sem lista fechada por enquanto.';
