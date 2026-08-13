-- Renomeia o conceito "Cliente" para "Empresa" em toda a base: tabela
-- principal, tabelas dependentes, colunas de FK, e os nomes de
-- constraint/index/trigger/policy derivados (Postgres não renomeia esses
-- sozinho quando a tabela/coluna referenciada muda de nome — só a ligação
-- por OID é automática).

alter table public.clientes rename to empresas;
alter table public.contatos_cliente rename to contatos_empresa;
alter table public.interacoes_cliente rename to interacoes_empresa;

alter table public.propostas rename column cliente_id to empresa_id;
alter table public.compromissos rename column cliente_id to empresa_id;
alter table public.contatos_empresa rename column cliente_id to empresa_id;
alter table public.interacoes_empresa rename column cliente_id to empresa_id;

-- Constraints (PK/FK)
alter table public.empresas rename constraint clientes_pkey to empresas_pkey;
alter table public.empresas rename constraint clientes_created_by_fkey to empresas_created_by_fkey;
alter table public.propostas rename constraint propostas_cliente_id_fkey to propostas_empresa_id_fkey;
alter table public.compromissos rename constraint compromissos_cliente_id_fkey to compromissos_empresa_id_fkey;
alter table public.contatos_empresa rename constraint contatos_cliente_pkey to contatos_empresa_pkey;
alter table public.contatos_empresa rename constraint contatos_cliente_cliente_id_fkey to contatos_empresa_empresa_id_fkey;
alter table public.interacoes_empresa rename constraint interacoes_cliente_pkey to interacoes_empresa_pkey;
alter table public.interacoes_empresa rename constraint interacoes_cliente_cliente_id_fkey to interacoes_empresa_empresa_id_fkey;
alter table public.interacoes_empresa rename constraint interacoes_cliente_autor_id_fkey to interacoes_empresa_autor_id_fkey;

-- Indexes
alter index public.clientes_created_by_idx rename to empresas_created_by_idx;
alter index public.clientes_setor_idx rename to empresas_setor_idx;
alter index public.contatos_cliente_cliente_id_idx rename to contatos_empresa_empresa_id_idx;
alter index public.propostas_cliente_id_idx rename to propostas_empresa_id_idx;
alter index public.compromissos_cliente_id_idx rename to compromissos_empresa_id_idx;
alter index public.interacoes_cliente_cliente_id_idx rename to interacoes_empresa_empresa_id_idx;
alter index public.interacoes_cliente_autor_id_idx rename to interacoes_empresa_autor_id_idx;

-- Trigger
alter trigger clientes_set_updated_at on public.empresas rename to empresas_set_updated_at;

-- RLS policies
alter policy clientes_select on public.empresas rename to empresas_select;
alter policy clientes_insert on public.empresas rename to empresas_insert;
alter policy clientes_update on public.empresas rename to empresas_update;
alter policy clientes_delete on public.empresas rename to empresas_delete;

alter policy contatos_cliente_select on public.contatos_empresa rename to contatos_empresa_select;
alter policy contatos_cliente_insert on public.contatos_empresa rename to contatos_empresa_insert;
alter policy contatos_cliente_update on public.contatos_empresa rename to contatos_empresa_update;
alter policy contatos_cliente_delete on public.contatos_empresa rename to contatos_empresa_delete;

alter policy interacoes_cliente_select on public.interacoes_empresa rename to interacoes_empresa_select;
alter policy interacoes_cliente_insert on public.interacoes_empresa rename to interacoes_empresa_insert;
