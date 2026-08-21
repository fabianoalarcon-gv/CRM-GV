-- Dispara o envio de e-mail de notificação (rota
-- src/app/api/webhooks/notificacao-email) sempre que uma linha nova entra em
-- notificacoes — mesmo funil de eventos já usado pelo sino in-app (novo
-- Lead, nova Proposta, nova Ação, etc.).
--
-- Não usamos o recurso "Database Webhooks" do Dashboard porque esse projeto
-- nunca teve o schema supabase_functions provisionado (Dashboard falha com
-- "schema supabase_functions does not exist" ao tentar criar o webhook por
-- lá). Em vez disso, chamamos pg_net diretamente — mesma tecnologia por
-- baixo dos panos, só sem depender do wrapper do Dashboard.
--
-- O segredo compartilhado com a rota (SUPABASE_WEBHOOK_SECRET) NÃO fica
-- neste arquivo (isso vazaria no histórico do git) — fica no Vault do
-- Supabase, gravado uma única vez via SQL Editor:
--   select vault.create_secret('<valor>', 'notificacao_email_webhook_secret');
-- Se o segredo ainda não tiver sido gravado, a function simplesmente não
-- envia nada (não bloqueia o insert da notificação).

create extension if not exists pg_net;

create or replace function private.notificar_email_webhook()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_secret text;
begin
  select decrypted_secret into v_secret
  from vault.decrypted_secrets
  where name = 'notificacao_email_webhook_secret';

  if v_secret is null then
    return new;
  end if;

  perform net.http_post(
    url := 'https://crm-gv.vercel.app/api/webhooks/notificacao-email',
    body := jsonb_build_object('record', to_jsonb(new)),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_secret
    )
  );

  return new;
end;
$$;

create trigger notificacoes_email_webhook
  after insert on public.notificacoes
  for each row execute function private.notificar_email_webhook();
