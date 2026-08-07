# BUGS — LogiHub CRM

> Registro de bugs encontrados durante o desenvolvimento. Marque `[x]` quando corrigido. Ordenar do mais recente para o mais antigo.

---

## Abertos

_Nenhum bug em aberto no momento._

---

## Corrigidos

- [x] **BUG-005** — Login via Supabase Auth falhava em produção (Vercel), mas funcionava localmente e direto contra a API
  - **Onde**: Configuração do projeto Supabase (Authentication > URL Configuration), não era código da aplicação
  - **Descrição**: no deploy do Vercel, o login com credenciais válidas sempre retornava "e-mail ou senha inválidos". As mesmas credenciais funcionavam via `curl` direto na API e localmente via `npm run dev`. Env vars já haviam sido conferidas como corretas em Production e Preview no Vercel.
  - **Causa raiz**: o **Site URL** do Supabase Auth estava travado em `http://localhost:3000` e a lista de **Redirect URLs** estava vazia — o Supabase Auth valida a origem/URL de requisições de login contra essa lista, então requisições vindas do domínio do Vercel eram rejeitadas.
  - **Como foi encontrado**: usuário verificou Authentication > URL Configuration no dashboard do Supabase a pedido; confirmado via `curl` simulando o header `Origin` do domínio do Vercel contra a API antes de aplicar a correção.
  - **Correção**: adicionadas `http://localhost:3000/**`, `https://crm-gv-git-dev-fabianoalarcon-6118s-projects.vercel.app/**` e `https://*-fabianoalarcon-6118s-projects.vercel.app/**` (cobre qualquer preview do projeto) em Redirect URLs. Login real confirmado funcionando no Vercel pelo usuário. Removido o bypass temporário (`src/lib/dev-bypass.ts` e os usos em `src/app/login/page.tsx` e `src/lib/supabase/middleware.ts`), que não é mais necessário.
  - **Data**: 2026-08-07

- [x] **BUG-007** — Erro de hidratação do React no board do Pipeline (dnd-kit + SSR)
  - **Onde**: `src/modules/pipeline/components/Board.tsx` / `Column.tsx` / `ProposalCard.tsx`
  - **Descrição**: `useDraggable`/`useDroppable` do `@dnd-kit/core` geram um id interno (`aria-describedby="DndDescribedBy-N"`) usado pra acessibilidade; esse contador não bate entre a renderização no servidor (Server Component da página) e a hidratação no cliente, gerando `aria-describedby="DndDescribedBy-0"` no servidor vs `"-1"` no cliente — erro de hidratação do React (conhecido em issues do dnd-kit com SSR/Next.js).
  - **Como foi encontrado**: console do navegador (via Puppeteer) ao abrir `/pipeline` pela primeira vez.
  - **Correção**: criado `src/modules/pipeline/components/BoardClient.tsx`, que carrega o `Board` via `next/dynamic` com `ssr: false` (mostrando um skeleton simples enquanto isso) — o board interativo só é montado no cliente, então nunca há uma versão renderizada no servidor pra divergir.
  - **Data**: 2026-08-07

- [x] **BUG-006** — Funções do banco com falhas de segurança apontadas pelo `supabase db advisors`
  - **Onde**: `supabase/migrations/20260807010654_profiles.sql` (funções `set_updated_at` e `handle_new_user`)
  - **Descrição**: (1) `set_updated_at` foi criada sem `set search_path = ''`, deixando o `search_path` mutável (risco de sequestro de função via schema malicioso); (2) `handle_new_user` (SECURITY DEFINER, criadora do `profile` no signup) ficou com `EXECUTE` liberado por padrão para `anon`/`authenticated`, exposta como RPC pública em `/rest/v1/rpc/handle_new_user`.
  - **Como foi encontrado**: `supabase db advisors --linked --type security`, logo após aplicar as migrations do DB-01 a DB-08.
  - **Correção**: migration `20260807011534_fix_function_security.sql` — adiciona `search_path = ''` em `set_updated_at` e revoga `EXECUTE` de `handle_new_user` para `public/anon/authenticated`. Validado que o trigger de auto-criação de perfil continua funcionando (criação de usuário descartável + verificação + remoção).
  - **Data**: 2026-08-07

- [x] **BUG-004** — Botão `primary` quase invisível no modo escuro
  - **Onde**: `src/components/ui/Button.tsx` (variante `primary`)
  - **Descrição**: o botão primário usa fundo navy (`bg-brand-navy`), a mesma família de cor do fundo/superfícies no modo escuro — o botão "Entrar" da tela de login praticamente desaparecia contra o painel escuro.
  - **Como foi encontrado**: screenshot de verificação visual da tela de login recém-criada.
  - **Correção**: no dark mode, a variante `primary` passa a usar o laranja de destaque (`dark:bg-brand-accent dark:text-brand-navy`) em vez do navy, mantendo o navy só no modo claro (onde tem contraste alto contra fundo branco).
  - **Data**: 2026-08-06

- [x] **BUG-003** — Crash do Node (`Assertion failed ... UV_HANDLE_CLOSING`) ao rodar scripts com `@supabase/supabase-js`
  - **Onde**: `scripts/create-test-user.mjs`, qualquer script Node que use o client admin do Supabase e depois saia do processo
  - **Descrição**: no Windows (Node 24), o processo imprime `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c, line 76` ao final da execução — provavelmente um handle (websocket do realtime) não fechado corretamente pelo client antes do `process.exit`. Não corrompe o resultado (a chamada à API já havia completado com sucesso antes do crash), mas polui a saída e retorna exit code não-zero.
  - **Como foi encontrado**: ao rodar `node --env-file=.env.local scripts/create-test-user.mjs ...` para criar o usuário de teste.
  - **Correção**: nenhuma aplicada — é um comportamento conhecido do Node/libuv no Windows com conexões websocket pendentes; o resultado da operação deve ser validado pela saída impressa antes do crash (ou por uma chamada de verificação separada), não pelo exit code.
  - **Data**: 2026-08-06

- [x] **BUG-002** — Uso da convenção depreciada `middleware.ts` em vez de `proxy.ts`
  - **Onde**: `src/middleware.ts` (renomeado para `src/proxy.ts`)
  - **Descrição**: o Next.js 16 renomeou a convenção `middleware` para `proxy` (função exportada também muda de nome). O build acusava aviso de depreciação ao criar o middleware de refresh de sessão do Supabase.
  - **Como foi encontrado**: aviso `⚠ The "middleware" file convention is deprecated` no `npm run build`, ao configurar o cliente Supabase (PREP-06).
  - **Correção**: arquivo renomeado para `src/proxy.ts` e função `middleware` renomeada para `proxy`, conforme `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`.
  - **Data**: 2026-08-06

- [x] **BUG-001** — Logo ilegível no modo escuro
  - **Onde**: `src/components/brand/Logo.tsx`, usado no `Header`
  - **Descrição**: o `logo_logihub.png` é navy sobre fundo transparente; no dark mode (fundo escuro do header) o texto "LogiHub" ficava quase invisível por falta de contraste.
  - **Como foi encontrado**: screenshot de verificação visual do layout (`npm run dev` + captura headless) logo após implementar o `AppShell`.
  - **Correção**: adicionado fundo branco (`dark:bg-white`) num wrapper ao redor da imagem, aplicado apenas no dark mode.
  - **Data**: 2026-08-06

---

## Como registrar um novo bug

```markdown
- [ ] **BUG-XXX** — Título curto do problema
  - **Onde**: arquivo(s) ou módulo afetado
  - **Descrição**: o que acontece e em que condição
  - **Como foi encontrado**: teste manual, build, lint, relato do usuário, etc.
  - **Correção**: (preencher quando corrigido)
  - **Data**: AAAA-MM-DD
```
