-- Campos e Ações do menu Leads.
-- Um Lead (Prospecção/Qualificação) ainda não é uma proposta formal: não tem
-- número de proposta, valor definido nem tipo de serviço — por isso essas 3
-- colunas de `propostas` deixam de ser obrigatórias. Em troca, todo registro
-- (Lead ou Proposta) ganha um "Número do Lead" gerado automaticamente,
-- sequencial por ano, independente do número de proposta manual.

alter table public.propostas alter column numero_proposta drop not null;
alter table public.propostas alter column valor drop not null;
alter table public.propostas alter column valor drop default;
alter table public.propostas alter column tipo_servico drop not null;

alter table public.propostas add column numero_lead text unique;
alter table public.propostas add column segmento text
  check (segmento in ('armazenagem', 'servico', 'transporte'));

-- Numeração automática do Número do Lead (ex: L001/26, reinicia a cada ano).
-- Contador por ano numa tabela dedicada + upsert atômico (lock de linha do
-- `on conflict do update`) evita corrida entre inserções concorrentes.
create table public.lead_number_counters (
  ano integer primary key,
  ultimo_numero integer not null default 0
);

alter table public.lead_number_counters enable row level security;
-- Sem policies: só a function security definer abaixo grava/lê aqui —
-- ninguém precisa (nem deve) acessar isso direto via API.

create or replace function public.gerar_numero_lead()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  proximo_numero integer;
begin
  insert into public.lead_number_counters (ano, ultimo_numero)
  values (extract(year from now())::integer, 1)
  on conflict (ano) do update
    set ultimo_numero = public.lead_number_counters.ultimo_numero + 1
  returning ultimo_numero into proximo_numero;

  new.numero_lead := 'L' || lpad(proximo_numero::text, 3, '0') || '/' || to_char(now(), 'YY');
  return new;
end;
$$;

revoke execute on function public.gerar_numero_lead() from public, anon, authenticated;

create trigger propostas_gerar_numero_lead
  before insert on public.propostas
  for each row
  when (new.numero_lead is null)
  execute function public.gerar_numero_lead();

-- Backfill: propostas já existentes (seed) também ganham um Número do Lead,
-- usando created_at como proxy de quando "viraram lead"; o contador é
-- semeado com a contagem real pra próximos inserts continuarem a sequência.
with backfill as (
  select id, created_at,
         row_number() over (partition by extract(year from created_at) order by created_at) as rn
  from public.propostas
)
update public.propostas p
set numero_lead = 'L' || lpad(backfill.rn::text, 3, '0') || '/' || to_char(p.created_at, 'YY')
from backfill
where p.id = backfill.id;

insert into public.lead_number_counters (ano, ultimo_numero)
select extract(year from created_at)::integer, count(*)::integer
from public.propostas
group by 1
on conflict (ano) do update set ultimo_numero = excluded.ultimo_numero;

-- propostas_historico: distingue "Andamento" de "Observações" — mesmo log,
-- duas listas separadas na UI. Histórico existente vira 'observacao' (é o
-- que já era, semanticamente).
alter table public.propostas_historico
  add column tipo text not null default 'observacao'
    check (tipo in ('andamento', 'observacao'));

-- compromissos: link opcional pro Lead que originou a Ação — é o que faz uma
-- Ação criada no Lead aparecer automaticamente no Calendário (mesma linha).
alter table public.compromissos add column proposta_id bigint
  references public.propostas (id) on delete set null;
create index compromissos_proposta_id_idx on public.compromissos (proposta_id);
