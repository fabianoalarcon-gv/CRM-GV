alter table public.contatos_empresa
  add column telefone_tipo text check (telefone_tipo in ('celular', 'fixo')),
  add column principal boolean not null default false;
