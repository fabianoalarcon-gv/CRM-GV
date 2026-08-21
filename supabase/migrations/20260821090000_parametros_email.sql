-- Menu Parâmetros > seção "E-mail": configuração do envio de e-mails de
-- notificação (novo Lead, nova Proposta, nova Ação, etc.), disparado por um
-- Supabase Database Webhook em INSERT na tabela notificacoes (ver rota
-- src/app/api/webhooks/notificacao-email). Tabela singleton (id fixo em 1),
-- mesmo padrão de parametros_notificacao / parametros_retomada_lead_arquivado.
--
-- As credenciais SMTP (host, usuário, senha) NÃO ficam aqui — são segredo e
-- vivem em variável de ambiente (SMTP_HOST/SMTP_USER/SMTP_PASSWORD). Esta
-- tabela guarda só o comportamento (o que já é seguro expor a um admin
-- logado): remetente exibido, quais tipos de evento geram e-mail, e o modo
-- teste (enquanto usuários de teste não têm e-mail válido, tudo é
-- redirecionado para email_teste em vez do destinatário real).

create table public.parametros_email (
  id integer primary key default 1 check (id = 1),
  ativo boolean not null default true,
  nome_remetente text not null default 'CRM Gran Vale',
  modo_teste boolean not null default true,
  email_teste text,
  tipos_habilitados text[] not null default array['novo_lead', 'nova_proposta', 'nova_acao'],
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id)
);

insert into public.parametros_email (id) values (1);

create trigger parametros_email_set_updated_at
  before update on public.parametros_email
  for each row execute function public.set_updated_at();

alter table public.parametros_email enable row level security;

-- Mesma convenção das outras tabelas de Parâmetros: RBAC 100% em código
-- (requireAdmin na Server Action), sem policy de insert/update/delete.
create policy parametros_email_select on public.parametros_email
  for select to authenticated using (true);
