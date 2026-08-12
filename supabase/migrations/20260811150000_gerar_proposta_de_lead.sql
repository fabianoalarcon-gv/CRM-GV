-- Permite promover um Lead (estágio Qualificação) para uma Proposta formal
-- no Pipeline. O registro é o mesmo (mesma linha de `propostas`), só muda de
-- estágio — mas ganha um Número de Proposta novo (rastreável ao Número do
-- Lead original) e uma marca (`gerado_de_lead`) que habilita reverter depois.

alter table public.propostas
  add column gerado_de_lead boolean not null default false;

-- Numeração automática do Número da Proposta quando gerada a partir de um
-- Lead — mesmo padrão de contador atômico por ano já usado em
-- `gerar_numero_lead()`, mas aqui é uma function comum (não trigger),
-- chamada sob demanda via RPC pelo botão "Gerar Proposta".
create table public.proposta_number_counters (
  ano integer primary key,
  ultimo_numero integer not null default 0
);

alter table public.proposta_number_counters enable row level security;
-- Sem policies: só a function security definer abaixo grava/lê aqui.

-- Semeia o contador a partir dos números de proposta manuais já existentes
-- (formato NNN/AA, com sufixo de revisão opcional tipo "028/25.1"), pra
-- números novos nunca colidirem com os já digitados.
insert into public.proposta_number_counters (ano, ultimo_numero)
select
  (2000 + substring(numero_proposta from '/(\d{2})')::integer) as ano,
  max(substring(numero_proposta from '^(\d{3})')::integer) as ultimo_numero
from public.propostas
where numero_proposta ~ '^\d{3}/\d{2}(\.\d+)?$'
group by 1
on conflict (ano) do update
  set ultimo_numero = greatest(public.proposta_number_counters.ultimo_numero, excluded.ultimo_numero);

create or replace function public.gerar_numero_proposta()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  proximo_numero integer;
begin
  insert into public.proposta_number_counters (ano, ultimo_numero)
  values (extract(year from now())::integer, 1)
  on conflict (ano) do update
    set ultimo_numero = public.proposta_number_counters.ultimo_numero + 1
  returning ultimo_numero into proximo_numero;

  return lpad(proximo_numero::text, 3, '0') || '/' || to_char(now(), 'YY');
end;
$$;

revoke execute on function public.gerar_numero_proposta() from public, anon;
grant execute on function public.gerar_numero_proposta() to authenticated;
