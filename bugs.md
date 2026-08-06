# BUGS — LogiHub CRM

> Registro de bugs encontrados durante o desenvolvimento. Marque `[x]` quando corrigido. Ordenar do mais recente para o mais antigo.

---

## Abertos

_Nenhum bug em aberto no momento._

---

## Corrigidos

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
