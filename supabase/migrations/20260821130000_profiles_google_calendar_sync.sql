-- Nem todo usuário do CRM tem e-mail dentro do Workspace granvale.com.br
-- (a delegação em todo o domínio só autoriza a Service Account a agir em
-- contas desse domínio) — esse flag deixa explícito, por usuário, se ele
-- deve receber os eventos de Ação sincronizados no Google Calendar dele.
-- Default false: um usuário novo só sincroniza se um admin marcar essa
-- opção explicitamente (evita falhas silenciosas de e-mails fora do domínio).

alter table public.profiles add column google_calendar_sync boolean not null default false;
