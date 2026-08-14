-- Explode o campo único "endereço" da empresa em partes (endereço, número,
-- cidade, UF, CEP) e adiciona o CNPJ, que antes não existia no cadastro.

alter table public.empresas
  add column cnpj text,
  add column numero text,
  add column cidade text,
  add column uf text,
  add column cep text;
