# SKILLS — LogiHub CRM

> Registro das skills instaladas para os agentes de IA (Claude Code e outros) que trabalham neste repositório. O inventário técnico fica em `skills-lock.json` (gerado pela CLI `skills`); este arquivo documenta o *porquê* de cada uma.

Skills ficam em `.agents/skills/<nome>` (fonte universal) com um symlink em `.claude/skills/<nome>` para o Claude Code. Ambas as pastas são versionadas — assim qualquer sessão futura (ou outro colaborador) já tem as mesmas skills disponíveis sem reinstalar.

---

## Instaladas

- [x] **frontend-design** — `anthropics/skills`
  - **Por quê**: orienta decisões de design visual (paleta, tipografia, layout) para não cair em UI genérica de IA. Útil conforme avançarmos nos módulos com telas reais (Pipeline, Clientes, Dashboard, Calendário) além do design system provisório do PREP.
  - **Instalado em**: 2026-08-06

- [x] **webapp-testing** — `anthropics/skills`
  - **Por quê**: toolkit com Playwright para testar a aplicação local (screenshots, logs do navegador, verificação de funcionalidade). Substitui a abordagem manual com Chrome headless usada para validar o layout no PREP-13; será útil para testar os módulos PIPE/CLI/DASH/CAL conforme forem implementados.
  - **Instalado em**: 2026-08-06

- [x] **supabase-postgres-best-practices** — `supabase/agent-skills`
  - **Por quê**: guia de boas práticas de Postgres/Supabase (schema, migrations, RLS, índices, performance) mantido pela própria Supabase. Deve ser carregado antes de qualquer alteração no banco — essencial para o próximo bloco do cronograma (DB-01 a DB-10: tabelas, FKs, migrations SQL e RLS por perfil).
  - **Instalado em**: 2026-08-06

---

## Como instalar uma nova skill

```bash
npx skills add https://github.com/<org>/<repo> --skill <nome-da-skill>
```

Depois de instalar, atualize a seção "Instaladas" acima com o nome, a fonte e o motivo, e faça o commit de `.agents/`, `.claude/skills/` e `skills-lock.json` junto.

## Como atualizar/remover

```bash
npx skills update      # atualiza todas as skills instaladas
npx skills remove <nome-da-skill>
```
