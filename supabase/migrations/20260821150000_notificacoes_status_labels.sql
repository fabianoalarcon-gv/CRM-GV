-- A notificação de movimentação de card só guarda a frase pronta em texto
-- livre ("... foi movido do status X para Y"), sem os dois status
-- separados — o e-mail de notificação (ver rota
-- /api/webhooks/notificacao-email) precisa deles isolados pra formatar cada
-- um em negrito. Guarda os labels já resolvidos (não os ids) porque é
-- exatamente o que a function já calcula pra montar a frase.

alter table public.notificacoes add column status_anterior_label text;
alter table public.notificacoes add column status_novo_label text;

create or replace function private.notificar(
  p_tipo text,
  p_mensagem text,
  p_empresa_id bigint default null,
  p_proposta_id bigint default null,
  p_compromisso_id bigint default null,
  p_autor_id uuid default null,
  p_status_anterior_label text default null,
  p_status_novo_label text default null
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.notificacoes (
    tipo, mensagem, empresa_id, proposta_id, compromisso_id, autor_id,
    status_anterior_label, status_novo_label
  )
  values (
    p_tipo, p_mensagem, p_empresa_id, p_proposta_id, p_compromisso_id, p_autor_id,
    p_status_anterior_label, p_status_novo_label
  );
$$;

revoke execute on function private.notificar(text, text, bigint, bigint, bigint, uuid, text, text)
  from public, anon, authenticated;

-- A versão antiga (6 args, sem status labels) fica sem uso — remove pra não
-- haver duas sobrecargas ambíguas (mesma convenção da migration que trocou a
-- versão de 5 pra 6 args).
drop function if exists private.notificar(text, text, bigint, bigint, bigint, uuid);

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
      new.empresa_id, new.id, null, v_autor_id,
      v_status_label_old, v_status_label);
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
