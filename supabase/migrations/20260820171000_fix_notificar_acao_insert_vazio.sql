-- Bug pré-existente exposto por gerar_acoes_retomada_lead_arquivado: o
-- trigger de notificação em compromissos é STATEMENT-level (`for each
-- statement`), que dispara mesmo quando o INSERT afeta zero linhas — e o
-- corpo da function assumia sempre pelo menos 1 linha em `inserted`,
-- quebrando com "null value in column mensagem" quando a tabela de
-- transição vem vazia (exatamente o que acontece quando o cron roda e não
-- há nenhuma Ação de retomada elegível naquele dia).

create or replace function private.notificar_acao_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row record;
  v_empresa_nome text;
  v_count integer;
begin
  select count(*) into v_count from inserted;
  if v_count = 0 then
    return null;
  end if;

  select * into v_row from inserted order by inicio asc limit 1;
  select nome into v_empresa_nome from public.empresas where id = v_row.empresa_id;

  perform private.notificar('nova_acao',
    case
      when v_count > 1 then v_count || ' novas ações agendadas: ' || v_row.titulo
      else 'Nova ação agendada: ' || v_row.titulo
    end || coalesce(' — ' || v_empresa_nome, ''),
    v_row.empresa_id, v_row.proposta_id, v_row.id);
  return null;
end;
$$;

-- Defesa extra: evita disparar o statement de INSERT (e por consequência o
-- trigger acima) quando não há nenhuma Ação elegível no dia.
create or replace function public.gerar_acoes_retomada_lead_arquivado()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_params record;
  v_total integer := 0;
begin
  select * into v_params from public.parametros_retomada_lead_arquivado where id = 1;

  create temporary table tmp_retomada_elegiveis on commit drop as
  with ultimo_arquivamento as (
    select distinct on (h.proposta_id)
      h.id as status_historico_id, h.proposta_id, h.entrou_em
    from public.propostas_status_historico h
    join public.proposal_statuses s on s.id = h.status_id
    where s.key = 'arquivado'
    order by h.proposta_id, h.entrou_em desc
  )
  select ua.status_historico_id, ua.proposta_id, ua.entrou_em, p.numero_lead, p.empresa_id
  from ultimo_arquivamento ua
  join public.propostas p on p.id = ua.proposta_id
  join public.proposal_statuses s on s.id = p.status_id
  where s.key = 'arquivado'
    and floor(extract(epoch from (now() - ua.entrou_em)) / 86400)::int >= v_params.dias
    and not exists (
      select 1 from public.retomada_lead_arquivado_gerada g
      where g.status_historico_id = ua.status_historico_id
    );

  if not exists (select 1 from tmp_retomada_elegiveis) then
    return 0;
  end if;

  insert into public.compromissos (titulo, descricao, inicio, tipo, empresa_id, proposta_id, criado_por)
  select
    'Retomada comercial com um Lead arquivado',
    'Retomada comercial do Lead numero ' || t.numero_lead || ', após arquivamento em ' ||
      to_char(t.entrou_em at time zone 'America/Sao_Paulo', 'DD/MM/YYYY'),
    now(),
    v_params.categoria,
    t.empresa_id,
    t.proposta_id,
    null
  from tmp_retomada_elegiveis t;

  get diagnostics v_total = row_count;

  insert into public.retomada_lead_arquivado_gerada (status_historico_id)
  select status_historico_id from tmp_retomada_elegiveis;

  return v_total;
end;
$$;
