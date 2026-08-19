-- Histórico automático de mudança de status de um Lead/Proposta — alimenta o
-- indicador de "tempo de permanência por etapa" no Dashboard. Diferente de
-- `propostas_historico` (log manual de observações/andamento escrito pelo
-- usuário), esta tabela é escrita só pela trigger abaixo, sem intervenção humana.

create table public.propostas_status_historico (
  id bigint generated always as identity primary key,
  proposta_id bigint not null references public.propostas (id) on delete cascade,
  status_id bigint not null references public.proposal_statuses (id),
  entrou_em timestamptz not null default now()
);

create index propostas_status_historico_proposta_id_idx
  on public.propostas_status_historico (proposta_id, entrou_em);

-- Uma linha por entrada em estágio: no INSERT da proposta (estágio inicial) e
-- em todo UPDATE que muda status_id. A duração de um estágio é calculada
-- depois, em código, como a diferença entre uma linha e a próxima da mesma
-- proposta (ou "agora", se for a mais recente — estágio ainda em andamento).
create or replace function public.registrar_mudanca_status_proposta()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.status_id is distinct from old.status_id then
    insert into public.propostas_status_historico (proposta_id, status_id)
    values (new.id, new.status_id);
  end if;
  return new;
end;
$$;

revoke execute on function public.registrar_mudanca_status_proposta() from public, anon, authenticated;

create trigger propostas_registrar_status_historico
  after insert or update of status_id on public.propostas
  for each row
  execute function public.registrar_mudanca_status_proposta();

-- Backfill: semeia uma linha por proposta já existente, usando created_at como
-- melhor aproximação disponível de "quando entrou no estágio atual" — registros
-- antigos não têm como ser reconstruídos com exatidão (mudanças de status
-- anteriores a esta migration não deixaram rastro).
insert into public.propostas_status_historico (proposta_id, status_id, entrou_em)
select id, status_id, created_at from public.propostas;

-- Mesmo modelo de RLS de `lead_number_counters`: só a trigger (security
-- definer) escreve aqui. Leitura liberada pro Dashboard.
alter table public.propostas_status_historico enable row level security;

create policy propostas_status_historico_select on public.propostas_status_historico
  for select to authenticated using (true);
