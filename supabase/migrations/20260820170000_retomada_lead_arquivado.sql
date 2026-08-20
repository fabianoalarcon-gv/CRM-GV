-- Menu Parâmetros > seção "Retomada de Leads Arquivados": após N dias que um
-- Lead entrou no estágio Arquivado, gera automaticamente uma Ação (categoria
-- configurável) pra retomar contato comercial. Mesmo desenho geral de
-- gerar_notificacoes_diarias (function security definer chamada 1x/dia via
-- RPC pela rota /api/cron), mas com semântica diferente: aqui a Ação deve
-- ser criada UMA ÚNICA VEZ por arquivamento, não reincidir todo dia enquanto
-- a condição persiste — por isso o controle de idempotência é por evento
-- (propostas_status_historico.id), não por dia.

create table public.parametros_retomada_lead_arquivado (
  id integer primary key default 1 check (id = 1),
  dias integer not null default 30 check (dias > 0),
  categoria text not null default 'ligacao'
    check (categoria in ('reuniao', 'ligacao', 'email', 'visita', 'follow_up', 'outro')),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id)
);

insert into public.parametros_retomada_lead_arquivado (id) values (1);

create trigger parametros_retomada_lead_arquivado_set_updated_at
  before update on public.parametros_retomada_lead_arquivado
  for each row execute function public.set_updated_at();

alter table public.parametros_retomada_lead_arquivado enable row level security;

-- Mesma convenção de parametros_notificacao: RBAC 100% em código
-- (requireAdmin na Server Action), sem policy de insert/update/delete.
create policy parametros_retomada_lead_arquivado_select
  on public.parametros_retomada_lead_arquivado
  for select to authenticated using (true);

-- compromissos.criado_por era NOT NULL (toda Ação até aqui tinha um autor
-- humano de verdade) — a Ação gerada por este cron não tem sessão de
-- usuário, então passa a aceitar NULL. Mesmo padrão já usado em
-- notificacoes.autor_id (NULL = gerado pelo sistema); a UI que exibe
-- "Criado por X" já trata autor ausente (criado_por_nome && ...).
alter table public.compromissos alter column criado_por drop not null;

-- Controle de idempotência: uma linha por entrada em "arquivado"
-- (propostas_status_historico.id) já processada, pra nunca gerar duas
-- Ações de retomada pro mesmo arquivamento. Se o Lead for reativado e
-- arquivado de novo depois, o novo arquivamento cria uma nova linha de
-- histórico com id diferente — fica elegível de novo naturalmente, sem
-- precisar resetar nada.
create table public.retomada_lead_arquivado_gerada (
  status_historico_id bigint primary key
    references public.propostas_status_historico (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.retomada_lead_arquivado_gerada enable row level security;

create policy retomada_lead_arquivado_gerada_select
  on public.retomada_lead_arquivado_gerada
  for select to authenticated using (true);

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
  where s.key = 'arquivado' -- ainda arquivado agora (não foi reativado desde então)
    and floor(extract(epoch from (now() - ua.entrou_em)) / 86400)::int >= v_params.dias
    and not exists (
      select 1 from public.retomada_lead_arquivado_gerada g
      where g.status_historico_id = ua.status_historico_id
    );

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

revoke execute on function public.gerar_acoes_retomada_lead_arquivado() from public, anon, authenticated;
grant execute on function public.gerar_acoes_retomada_lead_arquivado() to service_role;
