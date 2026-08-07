# BUGS — LogiHub CRM

> Registro de bugs encontrados durante o desenvolvimento. Marque `[x]` quando corrigido. Ordenar do mais recente para o mais antigo.

---

## Abertos

_Nenhum bug em aberto no momento._

---

## Corrigidos

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
