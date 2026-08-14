-- Guarda como a empresa chegou até a Granvale (origem do lead), exibido
-- e preenchido no cadastro/edição de empresa.

alter table public.empresas
  add column origem_lead text;
