-- Notificação de Nova Ação passa a incluir a data/hora do EVENTO em si
-- (compromissos.inicio, convertido pra horário de Brasília), não só a
-- data/hora em que a notificação foi criada (essa já aparece à parte, no
-- rodapé da UI).

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
  v_data_hora text;
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

  v_data_hora := to_char(v_row.inicio at time zone 'America/Sao_Paulo', 'DD/MM')
    || ' às ' || to_char(v_row.inicio at time zone 'America/Sao_Paulo', 'HH24:MI');

  perform private.notificar('nova_acao',
    case
      when v_count > 1 then v_count || ' novas ações agendadas (' || v_categoria || '): ' || v_row.titulo
      else 'Nova ação agendada (' || v_categoria || '): ' || v_row.titulo
    end || coalesce(' — ' || v_empresa_nome, '') || ' em ' || v_data_hora,
    v_row.empresa_id, v_row.proposta_id, v_row.id, v_row.criado_por);
  return null;
end;
$$;
