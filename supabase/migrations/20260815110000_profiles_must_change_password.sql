-- Marca contas criadas pelo Admin com senha provisória — o login força a
-- troca antes de liberar acesso ao sistema (ver src/app/login/page.tsx),
-- e a flag é limpa depois que o usuário define a própria senha.
alter table public.profiles
  add column must_change_password boolean not null default false;
