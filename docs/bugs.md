# BUGS — LogiHub CRM

> Registro de bugs encontrados durante o desenvolvimento. Marque `[x]` quando corrigido. Ordenar do mais recente para o mais antigo.
>
> **Todo bug real encontrado numa sessão — em teste, code review ou relato do usuário — deve ser registrado aqui** (seção "Abertos" se ainda não corrigido, "Corrigidos" se já resolvido na mesma sessão), seguindo o modelo no fim deste arquivo. Não deixar só narrado no log de sessão do `checklist.md`.

---

## Abertos

_Nenhum bug em aberto no momento._

---

## Corrigidos

- [x] **BUG-013** — Violação das regras de hooks do React no `HourGrid` do Calendário
  - **Onde**: `src/modules/calendario/components/CalendarioView.tsx`
  - **Descrição**: o cálculo dos dias da semana (`useMemo`) era chamado dentro de um bloco condicional do JSX (`{viewMode === "semana" && <HourGrid days={useMemo(...)} />}`) — hook só pode rodar incondicionalmente no topo do componente. Não chegou a dar erro visível na hora, mas quebraria ao alternar entre as visões Mês/Semana/Dia.
  - **Como foi encontrado**: code review do próprio código durante a implementação do `HourGrid` (não em teste).
  - **Correção**: cálculo (`weekDays`) movido pro topo do componente, antes de qualquer retorno condicional.
  - **Data**: 2026-08-07

- [x] **BUG-012** — Exportação de CSV (Empresas) cancelava o download em alguns navegadores
  - **Onde**: `src/modules/empresas/components/ExportEmpresasButton.tsx` (módulo se chamava "Clientes" na época)
  - **Descrição**: `URL.revokeObjectURL(...)` era chamado logo após o `click()` no link de download do Blob gerado — em alguns navegadores isso cancela o download, porque o clique só dispara o download de forma assíncrona.
  - **Como foi encontrado**: teste manual do botão "Exportar" durante o redesign da tela de Clientes (o teste automatizado via Puppeteer/CDP não conseguia validar downloads de forma confiável — limitação conhecida da ferramenta, não indicativo do bug em si).
  - **Correção**: `URL.revokeObjectURL` adiado com `setTimeout`, dando tempo do download disparar antes do Blob ser liberado.
  - **Data**: 2026-08-07

- [x] **BUG-011** — Estágios vazios do Pipeline mostrando a chave crua do banco em vez do rótulo
  - **Onde**: `src/modules/dashboard/queries.ts` (nova `getStatusLabels`) / `src/app/(app)/page.tsx`
  - **Descrição**: após a mudança do Pipeline de 3 para 5 estágios, colunas ainda sem nenhuma proposta real (Prospecção/Qualificação/Negociação) apareciam no Dashboard com a chave crua do banco (ex: `prospeccao`) em vez do rótulo (“Prospecção”).
  - **Causa raiz**: mais funda que o BUG-010 — o mapa de rótulos era inferido a partir das propostas existentes (`buildStatusLabelMap`), então um estágio sem nenhuma proposta *nunca* tinha rótulo pra inferir, filtro ou não.
  - **Como foi encontrado**: verificação visual durante o teste da migração pra 5 estágios.
  - **Correção**: rótulos passaram a vir direto da tabela `proposal_statuses` (nova query `getStatusLabels`), e `buildStatusLabelMap` foi removido do código.
  - **Data**: 2026-08-07

- [x] **BUG-010** — Rótulo de status do Dashboard caindo pra chave crua quando o filtro zerava os resultados
  - **Onde**: módulo Dashboard (`src/app/(app)/page.tsx` / componentes de gráfico) — corrigido definitivamente pelo BUG-011 depois
  - **Descrição**: com o filtro de período/tipo de serviço zerando os resultados, o gráfico de status mostrava a chave crua do banco (`em_analise`) em vez do rótulo (“Em análise”).
  - **Como foi encontrado**: teste funcional do Dashboard (DASH-11), validando os números batendo com uma query direta ao banco.
  - **Correção**: mapa de rótulos passou a ser calculado a partir da lista completa (não filtrada) de propostas, em vez da lista já filtrada. **Nota**: essa correção não cobria estágio sem nenhuma proposta real — ver BUG-011, que substituiu essa abordagem por completo.
  - **Data**: 2026-08-07

- [x] **BUG-009** — Link de recuperação de senha caía sempre em "Link inválido ou expirado"
  - **Onde**: `src/app/redefinir-senha/page.tsx`
  - **Descrição**: ao clicar num link real de recuperação de senha do Supabase (`.../redefinir-senha#access_token=...&type=recovery`), a página sempre mostrava "Link inválido ou expirado", mesmo com um token válido e recém-gerado.
  - **Causa raiz**: o link de recuperação chega como fragmento da URL (`#access_token=...`), que o navegador nunca envia ao servidor. O client "puro" do `@supabase/supabase-js` faz o parse automático desse fragmento (`detectSessionInUrl`), mas o client SSR (`@supabase/ssr`, usado neste projeto via `createBrowserClient`) não faz esse parse automaticamente — ele foi pensado para o fluxo baseado em cookies/PKCE. Resultado: `supabase.auth.getSession()` sempre retornava sessão vazia nessa página.
  - **Como foi encontrado**: testado o fluxo completo de recuperação de senha (AUTH-07) gerando um link real via Admin API (`supabase.auth.admin.generateLink`, sem depender de caixa de e-mail) e abrindo com Puppeteer.
  - **Correção**: `redefinir-senha/page.tsx` agora faz o parse manual de `window.location.hash`, extrai `access_token`/`refresh_token` e chama `supabase.auth.setSession(...)` explicitamente antes de cair no fallback de `getSession()`. Validado de ponta a ponta: link → sessão estabelecida → formulário exibido → senha redefinida → login com a nova senha funcionando.
  - **Data**: 2026-08-07

- [x] **BUG-008** — `NEXT_PUBLIC_SUPABASE_URL` errada no ambiente Production do Vercel (com `/rest/v1` sobrando)
  - **Onde**: Vercel → Settings → Environment Variables, `NEXT_PUBLIC_SUPABASE_URL` no escopo **Production** (não era código da aplicação)
  - **Descrição**: depois de corrigir o BUG-005, o login voltou a funcionar no preview (`crm-gv-git-dev-...`) mas continuou falhando na URL de produção de verdade (`https://crm-gv.vercel.app/`), agora com a mensagem "Invalid path specified in request URL" em vez de "e-mail ou senha inválidos".
  - **Causa raiz**: via DevTools > Network, a requisição de login estava indo para `https://xdcwsxbgedjzpmrbuegt.supabase.co/rest/v1/auth/v1/token` (nota o `/rest/v1` duplicado antes de `/auth/v1/token`) e caindo na API REST (PostgREST) em vez da API de Auth — retornando o erro do PostgREST `PGRST125` ("Invalid path specified in request URL"). A variável `NEXT_PUBLIC_SUPABASE_URL` no ambiente **Production** do Vercel estava configurada com `/rest/v1` no final, diferente do valor correto usado no ambiente Preview — cada ambiente tem suas próprias variáveis no Vercel, então só Production estava errado.
  - **Como foi encontrado**: usuário inspecionou a requisição via DevTools > Network a pedido, e colou a Request URL/status/resposta.
  - **Correção**: usuário corrigiu `NEXT_PUBLIC_SUPABASE_URL` no ambiente Production do Vercel para `https://xdcwsxbgedjzpmrbuegt.supabase.co` (sem `/rest/v1`, sem barra final) e refez o deploy. Login confirmado funcionando em produção.
  - **Data**: 2026-08-07

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
