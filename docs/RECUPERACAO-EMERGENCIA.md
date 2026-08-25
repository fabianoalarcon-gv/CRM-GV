# Recuperação de emergência — acesso Admin

Procedimento para o cenário em que **nenhum usuário Admin consegue mais entrar** no
sistema (conta desativada por engano, senha perdida, etc.) e por isso ninguém
consegue resolver isso pela própria tela de Usuários do app.

Isso só deveria ser necessário em último caso. No dia a dia, mantenha sempre
**pelo menos 2 contas Admin ativas** — hoje são:

- `fabiano.alarcon@granvale.com.br`
- `crm@granvale.com.br`

## Pré-requisito

Acesso ao painel do Supabase do projeto de **produção** (`CRM_LogiHub`, ref
`xdcwsxbgedjzpmrbuegt`) — isso é independente do app e do login normal do CRM,
então continua funcionando mesmo se todos os Admins do app estiverem
bloqueados.

## Reativar uma conta desativada por engano

**Supabase Dashboard → CRM_LogiHub → SQL Editor**, rode:

```sql
update public.profiles set is_active = true
where id = (select id from auth.users where email = 'email-da-pessoa@granvale.com.br');
```

## Promover alguém a Admin

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'email-da-pessoa@granvale.com.br');
```

## Redefinir a senha de alguém

**Não usar SQL para isso** — a senha fica armazenada com hash, não dá pra
definir uma nova direto por SQL. Em vez disso: **Supabase Dashboard →
CRM_LogiHub → Authentication → Users**, clique nos "..." ao lado da pessoa e
use a opção de redefinir senha por ali.

## Depois de resolver

Entre no CRM normalmente com a conta reativada/promovida e confirme que tudo
voltou ao normal pela própria tela de Usuários — o procedimento acima é só
pra destravar o primeiro acesso, o resto (convidar/editar outros usuários)
volta a ser feito pelo app normalmente.
