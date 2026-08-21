-- Flag por usuário para controlar quem recebe os e-mails de notificação do
-- sistema (novo Lead, nova Proposta, nova Ação, etc.) — mesmo padrão de
-- google_calendar_sync. Default true: preserva o comportamento atual (todo
-- usuário ativo recebe), só passa a permitir excluir usuários específicos
-- daqui pra frente.

alter table public.profiles add column email_notifications boolean not null default true;
