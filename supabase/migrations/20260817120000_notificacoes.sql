-- Central de notificações: eventos do sistema (empresa, lead, proposta,
-- movimentação de card, resultado, ação) são gravados por trigger (garante
-- que nenhum caminho de código esqueça de notificar) e mostrados a TODOS os
-- usuários. A leitura é por usuário (notificacoes_lidas) — quando alguém lê,
-- a notificação some da lista dele, mas continua ativa pros demais.

create table public.notificacoes (
  id bigint generated always as identity primary key,
  tipo text not null check (tipo in (
    'nova_empresa',
    'novo_lead',
    'nova_proposta',
    'movimentacao_card',
    'proposta_aprovada',
    'proposta_reprovada',
    'nova_acao'
  )),
  mensagem text not null,
  empresa_id bigint references public.empresas (id) on delete set null,
  proposta_id bigint references public.propostas (id) on delete set null,
  compromisso_id bigint references public.compromissos (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.notificacoes is
  'Eventos do sistema, compartilhados entre todos os usuários. Ver notificacoes_lidas para o status de leitura por usuário.';

create index notificacoes_created_at_idx on public.notificacoes (created_at desc);
create index notificacoes_empresa_id_idx on public.notificacoes (empresa_id);
create index notificacoes_proposta_id_idx on public.notificacoes (proposta_id);
create index notificacoes_compromisso_id_idx on public.notificacoes (compromisso_id);

create table public.notificacoes_lidas (
  notificacao_id bigint not null references public.notificacoes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  lida_em timestamptz not null default now(),
  primary key (notificacao_id, user_id)
);

comment on table public.notificacoes_lidas is
  'Marca de leitura por usuário — a notificação continua ativa pros usuários que ainda não leram.';

-- PK já cobre lookups por notificacao_id (coluna líder); user_id sozinho
-- (usado pela policy de select abaixo) precisa do próprio índice.
create index notificacoes_lidas_user_id_idx on public.notificacoes_lidas (user_id);

alter table public.notificacoes enable row level security;

create policy notificacoes_select on public.notificacoes
  for select to authenticated using (true);
-- Sem policy de insert/update/delete: só as functions security definer
-- abaixo (via trigger) escrevem aqui.

alter table public.notificacoes_lidas enable row level security;

create policy notificacoes_lidas_select on public.notificacoes_lidas
  for select to authenticated using (user_id = (select auth.uid()));
create policy notificacoes_lidas_insert on public.notificacoes_lidas
  for insert to authenticated with check (user_id = (select auth.uid()));

-- RPC: notificações que o usuário logado ainda não leu (anti-join simples,
-- mais direto que tentar expressar isso via embed do PostgREST).
create or replace function public.get_unread_notificacoes()
returns setof public.notificacoes
language sql
stable
security invoker
set search_path = ''
as $$
  select n.*
  from public.notificacoes n
  where not exists (
    select 1 from public.notificacoes_lidas nl
    where nl.notificacao_id = n.id and nl.user_id = (select auth.uid())
  )
  order by n.created_at asc;
$$;

revoke execute on function public.get_unread_notificacoes() from public, anon;
grant execute on function public.get_unread_notificacoes() to authenticated;

-- Helper interno: só os triggers abaixo chamam isso (bypass de RLS via
-- security definer, mesmo padrão de gerar_numero_lead/gerar_numero_proposta).
create or replace function private.notificar(
  p_tipo text,
  p_mensagem text,
  p_empresa_id bigint default null,
  p_proposta_id bigint default null,
  p_compromisso_id bigint default null
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.notificacoes (tipo, mensagem, empresa_id, proposta_id, compromisso_id)
  values (p_tipo, p_mensagem, p_empresa_id, p_proposta_id, p_compromisso_id);
$$;

revoke execute on function private.notificar(text, text, bigint, bigint, bigint)
  from public, anon, authenticated;

-- Nova empresa cadastrada.
create or replace function private.notificar_nova_empresa()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.notificar('nova_empresa', 'Nova empresa cadastrada: ' || new.nome, new.id);
  return new;
end;
$$;

create trigger empresas_notificar_insert
  after insert on public.empresas
  for each row execute function private.notificar_nova_empresa();

-- Novo lead OU nova proposta — mesmo insert em `propostas`, diferenciado por
-- numero_proposta já vir preenchido (proposta direta) ou não (lead).
create or replace function private.notificar_proposta_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_empresa_nome text;
begin
  select nome into v_empresa_nome from public.empresas where id = new.empresa_id;

  if new.numero_proposta is not null then
    perform private.notificar('nova_proposta',
      'Nova proposta incluída: ' || new.numero_proposta || ' — ' || coalesce(v_empresa_nome, 'empresa não informada'),
      new.empresa_id, new.id);
  else
    perform private.notificar('novo_lead',
      'Novo lead incluído: ' || coalesce(v_empresa_nome, 'empresa não informada'),
      new.empresa_id, new.id);
  end if;
  return new;
end;
$$;

create trigger propostas_notificar_insert
  after insert on public.propostas
  for each row execute function private.notificar_proposta_insert();

-- Movimentação de card (mudança de estágio, inclusive Lead virando Proposta)
-- e resultado (aprovado/reprovado).
create or replace function private.notificar_proposta_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_empresa_nome text;
  v_status_label text;
begin
  select nome into v_empresa_nome from public.empresas where id = new.empresa_id;

  if new.numero_proposta is not null and old.numero_proposta is null then
    perform private.notificar('nova_proposta',
      'Nova proposta incluída: ' || new.numero_proposta || ' — ' || coalesce(v_empresa_nome, 'empresa não informada'),
      new.empresa_id, new.id);
  elsif old.status_id is distinct from new.status_id then
    select label into v_status_label from public.proposal_statuses where id = new.status_id;
    perform private.notificar('movimentacao_card',
      coalesce(v_empresa_nome, 'Proposta') || ' movida para "' || coalesce(v_status_label, '—') || '"',
      new.empresa_id, new.id);
  end if;

  if old.resultado is distinct from new.resultado and new.resultado is not null then
    perform private.notificar(
      case new.resultado when 'aprovado' then 'proposta_aprovada' else 'proposta_reprovada' end,
      'Proposta ' || (case new.resultado when 'aprovado' then 'aprovada' else 'reprovada' end)
        || ': ' || coalesce(new.numero_proposta, new.numero_lead) || ' — '
        || coalesce(v_empresa_nome, 'empresa não informada'),
      new.empresa_id, new.id);
  end if;

  return new;
end;
$$;

create trigger propostas_notificar_update
  after update on public.propostas
  for each row execute function private.notificar_proposta_update();

-- Nova ação (compromisso) — reunião, ligação etc. Trigger por STATEMENT (não
-- por linha): uma Ação com repetição insere várias linhas de uma vez
-- (createAcao em leads/actions.ts) e isso deve virar UMA notificação, não N.
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

create trigger compromissos_notificar_insert
  after insert on public.compromissos
  referencing new table as inserted
  for each statement execute function private.notificar_acao_insert();
