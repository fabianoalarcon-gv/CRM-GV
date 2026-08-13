-- Data de Início do Lead: editável no card do Lead, distinta do
-- created_at (data de criação do registro, sempre fixa). Default
-- current_date pra Leads/Propostas já existentes e para inserts que não
-- informam a coluna (ex: Proposta criada direto no Pipeline).
alter table public.propostas
  add column data_inicio_lead date not null default current_date;
