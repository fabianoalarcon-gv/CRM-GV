-- As notificações de inatividade diária ("sem movimentação"/"sem ação"/"sem
-- contato") só guardavam a frase pronta em texto livre, com o número de
-- dias embutido no meio — o e-mail de notificação precisa desse número
-- isolado pra formatar em negrito. gerar_notificacoes_diarias() já calcula
-- esse valor (d.dias) em cada bloco pra montar a frase; só passa a
-- persistir também.

alter table public.notificacoes add column dias integer;

create or replace function public.gerar_notificacoes_diarias()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_params record;
  v_hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  v_total integer := 0;
  v_count integer;
begin
  select * into v_params from public.parametros_notificacao where id = 1;

  -- 1) Leads sem movimentação de estágio (última entrada em
  -- propostas_status_historico daquela proposta).
  with ultimo_estagio as (
    select distinct on (proposta_id) proposta_id, entrou_em
    from public.propostas_status_historico
    order by proposta_id, entrou_em desc
  )
  insert into public.notificacoes (tipo, mensagem, empresa_id, proposta_id, evento_dia, dias)
  select
    'lead_sem_movimentacao',
    'Lead ' || p.numero_lead || ' está há ' || d.dias || ' dia'
      || case when d.dias = 1 then '' else 's' end
      || ' sem movimentação — ' || coalesce(e.nome, 'empresa não informada'),
    p.empresa_id, p.id, v_hoje, d.dias
  from public.propostas p
  join public.proposal_statuses s on s.id = p.status_id
  join public.empresas e on e.id = p.empresa_id
  join ultimo_estagio u on u.proposta_id = p.id
  cross join lateral (
    select floor(extract(epoch from (now() - u.entrou_em)) / 86400)::int as dias
  ) d
  where s.key in ('prospeccao', 'qualificacao')
    and d.dias >= v_params.dias_lead_sem_movimentacao
  on conflict (tipo, coalesce(proposta_id, -1), coalesce(empresa_id, -1), evento_dia)
    where evento_dia is not null do nothing;
  get diagnostics v_count = row_count;
  v_total := v_total + v_count;

  -- 2) Propostas sem movimentação de estágio (mesmo desenho do bloco 1).
  with ultimo_estagio as (
    select distinct on (proposta_id) proposta_id, entrou_em
    from public.propostas_status_historico
    order by proposta_id, entrou_em desc
  )
  insert into public.notificacoes (tipo, mensagem, empresa_id, proposta_id, evento_dia, dias)
  select
    'proposta_sem_movimentacao',
    'Proposta ' || p.numero_proposta || ' está há ' || d.dias || ' dia'
      || case when d.dias = 1 then '' else 's' end
      || ' sem movimentação — ' || coalesce(e.nome, 'empresa não informada'),
    p.empresa_id, p.id, v_hoje, d.dias
  from public.propostas p
  join public.proposal_statuses s on s.id = p.status_id
  join public.empresas e on e.id = p.empresa_id
  join ultimo_estagio u on u.proposta_id = p.id
  cross join lateral (
    select floor(extract(epoch from (now() - u.entrou_em)) / 86400)::int as dias
  ) d
  where s.key in ('proposta', 'negociacao')
    and d.dias >= v_params.dias_proposta_sem_movimentacao
  on conflict (tipo, coalesce(proposta_id, -1), coalesce(empresa_id, -1), evento_dia)
    where evento_dia is not null do nothing;
  get diagnostics v_count = row_count;
  v_total := v_total + v_count;

  -- 3) Empresas sem nenhum contato cadastrado — conta desde created_at
  -- (não há campo melhor pra "início da contagem" pra quem nunca teve
  -- contato).
  insert into public.notificacoes (tipo, mensagem, empresa_id, evento_dia, dias)
  select
    'empresa_sem_contato',
    'Empresa ' || e.nome || ' está há ' || d.dias || ' dia'
      || case when d.dias = 1 then '' else 's' end
      || ' sem nenhum contato cadastrado',
    e.id, v_hoje, d.dias
  from public.empresas e
  cross join lateral (
    select floor(extract(epoch from (now() - e.created_at)) / 86400)::int as dias
  ) d
  where not exists (select 1 from public.contatos_empresa c where c.empresa_id = e.id)
    and d.dias >= v_params.dias_empresa_sem_contato
  on conflict (tipo, coalesce(proposta_id, -1), coalesce(empresa_id, -1), evento_dia)
    where evento_dia is not null do nothing;
  get diagnostics v_count = row_count;
  v_total := v_total + v_count;

  -- 4) Leads sem nenhuma ação. Usa compromissos.inicio (momento real do
  -- engajamento, agendado ou já realizado) — se a ação mais recente tem
  -- inicio no futuro, o lead já tem próximo passo agendado e corretamente
  -- NÃO é tratado como esquecido (now() - inicio fica negativo, nunca bate
  -- o limiar). Sem nenhuma ação registrada, conta desde a criação do lead.
  with ultima_acao as (
    select proposta_id, max(inicio) as ultima
    from public.compromissos
    where proposta_id is not null
    group by proposta_id
  )
  insert into public.notificacoes (tipo, mensagem, empresa_id, proposta_id, evento_dia, dias)
  select
    'lead_sem_acao',
    'Lead ' || p.numero_lead || ' está há ' || d.dias || ' dia'
      || case when d.dias = 1 then '' else 's' end
      || ' sem nenhuma ação registrada — ' || coalesce(e.nome, 'empresa não informada'),
    p.empresa_id, p.id, v_hoje, d.dias
  from public.propostas p
  join public.proposal_statuses s on s.id = p.status_id
  join public.empresas e on e.id = p.empresa_id
  left join ultima_acao a on a.proposta_id = p.id
  cross join lateral (
    select floor(extract(epoch from (now() - coalesce(a.ultima, p.created_at))) / 86400)::int as dias
  ) d
  where s.key in ('prospeccao', 'qualificacao')
    and d.dias >= v_params.dias_lead_sem_acao
  on conflict (tipo, coalesce(proposta_id, -1), coalesce(empresa_id, -1), evento_dia)
    where evento_dia is not null do nothing;
  get diagnostics v_count = row_count;
  v_total := v_total + v_count;

  -- 5) Propostas sem nenhuma ação (mesmo desenho do bloco 4).
  with ultima_acao as (
    select proposta_id, max(inicio) as ultima
    from public.compromissos
    where proposta_id is not null
    group by proposta_id
  )
  insert into public.notificacoes (tipo, mensagem, empresa_id, proposta_id, evento_dia, dias)
  select
    'proposta_sem_acao',
    'Proposta ' || p.numero_proposta || ' está há ' || d.dias || ' dia'
      || case when d.dias = 1 then '' else 's' end
      || ' sem nenhuma ação registrada — ' || coalesce(e.nome, 'empresa não informada'),
    p.empresa_id, p.id, v_hoje, d.dias
  from public.propostas p
  join public.proposal_statuses s on s.id = p.status_id
  join public.empresas e on e.id = p.empresa_id
  left join ultima_acao a on a.proposta_id = p.id
  cross join lateral (
    select floor(extract(epoch from (now() - coalesce(a.ultima, p.created_at))) / 86400)::int as dias
  ) d
  where s.key in ('proposta', 'negociacao')
    and d.dias >= v_params.dias_proposta_sem_acao
  on conflict (tipo, coalesce(proposta_id, -1), coalesce(empresa_id, -1), evento_dia)
    where evento_dia is not null do nothing;
  get diagnostics v_count = row_count;
  v_total := v_total + v_count;

  return v_total;
end;
$$;

revoke execute on function public.gerar_notificacoes_diarias() from public, anon, authenticated;
grant execute on function public.gerar_notificacoes_diarias() to service_role;
