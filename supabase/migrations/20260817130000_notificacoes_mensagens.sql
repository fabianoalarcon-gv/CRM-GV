-- Enriquece as notificações: número do Lead/Proposta, empresa, de/para na
-- movimentação de card, categoria da Ação, e o autor da ação (pra exibir
-- "data/hora · usuário" na UI, sem precisar embutir isso na frase).

alter table public.notificacoes
  add column autor_id uuid references public.profiles (id) on delete set null;

create index notificacoes_autor_id_idx on public.notificacoes (autor_id);

-- private.notificar ganha o parâmetro do autor.
create or replace function private.notificar(
  p_tipo text,
  p_mensagem text,
  p_empresa_id bigint default null,
  p_proposta_id bigint default null,
  p_compromisso_id bigint default null,
  p_autor_id uuid default null
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.notificacoes (tipo, mensagem, empresa_id, proposta_id, compromisso_id, autor_id)
  values (p_tipo, p_mensagem, p_empresa_id, p_proposta_id, p_compromisso_id, p_autor_id);
$$;

revoke execute on function private.notificar(text, text, bigint, bigint, bigint, uuid)
  from public, anon, authenticated;

-- A versão antiga (5 args, sem autor) fica sem uso — remove pra não haver
-- duas sobrecargas ambíguas.
drop function if exists private.notificar(text, text, bigint, bigint, bigint);

-- Nova empresa cadastrada — mesma frase, agora com o autor (created_by).
create or replace function private.notificar_nova_empresa()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.notificar('nova_empresa', 'Nova empresa cadastrada: ' || new.nome,
    new.id, null, null, new.created_by);
  return new;
end;
$$;

-- Novo lead / nova proposta — inclui número (Lead ou Proposta) e empresa.
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
      'Nova Proposta ' || new.numero_proposta || ' incluída da empresa ' ||
        coalesce(v_empresa_nome, 'não informada'),
      new.empresa_id, new.id, null, new.created_by);
  else
    perform private.notificar('novo_lead',
      'Novo Lead ' || new.numero_lead || ' incluído da empresa ' ||
        coalesce(v_empresa_nome, 'não informada'),
      new.empresa_id, new.id, null, new.created_by);
  end if;
  return new;
end;
$$;

-- Movimentação de card (de/para) e resultado — autor é quem fez ESTA
-- alteração (não há coluna "updated_by" salva na linha, então usa a sessão
-- atual via auth.uid()).
create or replace function private.notificar_proposta_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_empresa_nome text;
  v_status_label text;
  v_status_label_old text;
  v_numero text;
  v_autor_id uuid;
begin
  select nome into v_empresa_nome from public.empresas where id = new.empresa_id;
  v_numero := coalesce(new.numero_proposta, new.numero_lead);
  v_autor_id := (select auth.uid());

  if new.numero_proposta is not null and old.numero_proposta is null then
    perform private.notificar('nova_proposta',
      'Nova Proposta ' || new.numero_proposta || ' incluída da empresa ' ||
        coalesce(v_empresa_nome, 'não informada'),
      new.empresa_id, new.id, null, v_autor_id);
  elsif old.status_id is distinct from new.status_id then
    select label into v_status_label from public.proposal_statuses where id = new.status_id;
    select label into v_status_label_old from public.proposal_statuses where id = old.status_id;
    perform private.notificar('movimentacao_card',
      v_numero || ' da empresa ' || coalesce(v_empresa_nome, 'não informada') ||
        ' foi movido do status ' || coalesce(v_status_label_old, '—') ||
        ' para ' || coalesce(v_status_label, '—'),
      new.empresa_id, new.id, null, v_autor_id);
  end if;

  if old.resultado is distinct from new.resultado and new.resultado is not null then
    perform private.notificar(
      case new.resultado when 'aprovado' then 'proposta_aprovada' else 'proposta_reprovada' end,
      v_numero || ' da empresa ' || coalesce(v_empresa_nome, 'não informada') || ' foi ' ||
        (case new.resultado when 'aprovado' then 'aprovada' else 'reprovada' end),
      new.empresa_id, new.id, null, v_autor_id);
  end if;

  return new;
end;
$$;

-- Nova ação — inclui a categoria (mesmos rótulos de TIPO_LABEL em
-- calendario/utils.ts) e o autor (criado_por).
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
  v_categoria text;
begin
  select count(*) into v_count from inserted;
  select * into v_row from inserted order by inicio asc limit 1;
  select nome into v_empresa_nome from public.empresas where id = v_row.empresa_id;

  v_categoria := case v_row.tipo
    when 'fretes' then 'Fretes Regulares'
    when 'reuniao' then 'Reuniões'
    when 'urgente' then 'Urgente'
    when 'embarque' then 'Embarques'
    when 'outro' then 'Outro'
    when 'ligacao' then 'Ligação'
    when 'email' then 'E-mail'
    when 'visita' then 'Visita'
    when 'follow_up' then 'Follow-Up'
    else 'Ação'
  end;

  perform private.notificar('nova_acao',
    case
      when v_count > 1 then v_count || ' novas ações agendadas (' || v_categoria || '): ' || v_row.titulo
      else 'Nova ação agendada (' || v_categoria || '): ' || v_row.titulo
    end || coalesce(' — ' || v_empresa_nome, ''),
    v_row.empresa_id, v_row.proposta_id, v_row.id, v_row.criado_por);
  return null;
end;
$$;
