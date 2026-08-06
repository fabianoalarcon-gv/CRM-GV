# BUGS — LogiHub CRM

> Registro de bugs encontrados durante o desenvolvimento. Marque `[x]` quando corrigido. Ordenar do mais recente para o mais antigo.

---

## Abertos

_Nenhum bug em aberto no momento._

---

## Corrigidos

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
