# CHECKLIST — Progresso do LogiHub CRM

> Espelha as tarefas de `cronograma.md`. Marque `[x]` conforme for concluindo, para retomar o trabalho sem precisar revisar o projeto inteiro. Atualizar este arquivo a cada sessão de trabalho.

---

## FASE 0 — Preparação e Setup Inicial (PREP)

- [x] PREP-01 | Criar repositório Git e definir estratégia de branches (main/dev/feature)
- [x] PREP-02 | Inicializar projeto Next.js
- [x] PREP-03 | Instalar e configurar Tailwind CSS
- [x] PREP-04 | Criar organização e projeto no Supabase
- [x] PREP-05 | Configurar variáveis de ambiente (.env local e produção)
- [x] PREP-06 | Instalar e configurar cliente Supabase no Next.js (auth + db client)
- [x] PREP-07 | Conectar projeto ao Vercel e validar deploy "hello world"
- [x] PREP-08 | Definir estrutura de pastas modular por domínio (ex: /modules/pipeline, /modules/clientes)
- [x] PREP-09 | Configurar ESLint + Prettier + convenções de código
- [x] PREP-10 | Criar design system base (variáveis de cor provisórias, tipografia, espaçamento no Tailwind)
- [x] PREP-11 | Criar componentes de UI reutilizáveis: Button, Card, Input, Select, Modal, Badge, Table
- [x] PREP-12 | Criar componente de Logo (placeholder, pronto para substituição futura)
- [x] PREP-13 | Criar layout base: header, sidebar de navegação, área de conteúdo, responsivo

---

## Banco de Dados (DB)

`[depende de: PREP-04, PREP-05, PREP-06]`

- [x] DB-01 | Modelar tabela Usuários e tabela de Perfis/Roles (Admin, Comercial + reservar Operações/Financeiro) — tabela `profiles` (1-para-1 com `auth.users`), roles admin/comercial/operacoes/financeiro
- [x] DB-02 | Modelar tabela Clientes/Empresas (nome, setor, contatos, endereço, observações) — `clientes` + `contatos_cliente` (1 cliente : N contatos)
- [x] DB-03 | Modelar tabela Propostas (todos os campos da planilha: nº proposta, data, valor, status, termômetro, tipo, descrição, observações) — `propostas` + `propostas_historico` (log de observações do PIPE-12); status vira tabela `proposal_statuses` (não enum fixo) para suportar PIPE-13
- [x] DB-04 | Modelar tabela Histórico de Interações (vinculada a Clientes) — `interacoes_cliente`
- [x] DB-05 | Modelar tabela Compromissos (vinculada a Usuários, para o Calendário) — `compromissos`
- [x] DB-06 | Definir e criar chaves estrangeiras: Propostas↔Clientes, Propostas↔Usuários, Interações↔Clientes, Compromissos↔Usuários — todas integradas nas migrations acima
- [x] DB-07 | Escrever migrations SQL de todas as tabelas acima — `supabase/migrations/2026080701*.sql`, aplicadas via `supabase db push --linked`
- [x] DB-08 | Configurar Row Level Security (RLS) por perfil de usuário em cada tabela — RLS ativo em todas as 8 tabelas; `private.is_admin()` como helper; validado via `supabase db advisors` (2 achados corrigidos) e via REST API (anon bloqueado, authenticated liberado)
- [x] DB-09 | Criar script de seed com dados fictícios (setores: Automotivo, Offshore, Químico, Siderúrgico etc.) — `supabase/seed.sql`, 5 clientes/10 propostas/3 interações/3 compromissos
- [x] DB-10 | Validar integridade referencial rodando queries de teste (joins entre as tabelas) — join de 4 tabelas e agregação por status testados no banco remoto

---

## Autenticação e Permissões (AUTH)

`[depende de: DB-01, DB-08]`

> Nota: AUTH-01/02/04 foram adiantados fora de ordem (2026-08-06), a pedido do usuário, usando só o Auth nativo do Supabase (tabela `auth.users`), que não depende do nosso schema. A tabela de Perfis/Roles (DB-01) já existe agora — AUTH-05 e a parte de RBAC do AUTH-04 estão desbloqueadas, mas ainda não implementadas.
>
> ⚠️ **BUG-005 (aberto)**: o login real via Supabase Auth funciona localmente mas falha em produção (Vercel) por motivo ainda não identificado. Há um **bypass temporário** ativo (`src/lib/dev-bypass.ts`, credencial fixa `teste@logihub.dev`) para não bloquear o desenvolvimento — precisa ser removido depois que o BUG-005 for corrigido. Ver detalhes em `bugs.md`.

- [x] AUTH-01 | Configurar Supabase Auth com login por e-mail/senha
- [x] AUTH-02 | Construir tela de Login
- [ ] AUTH-03 | Construir tela de recuperação de senha
- [x] AUTH-04 | Implementar middleware/guard de proteção de rotas autenticadas — guarda básica (logado/deslogado) em `src/lib/supabase/middleware.ts`; falta a parte de RBAC por perfil (agora desbloqueada, DB-01 existe)
- [ ] AUTH-05 | Implementar lógica de RBAC no frontend (mostrar/ocultar ações por perfil) — tabela `profiles`/roles já existe (DB-01), falta consumir no frontend
- [ ] AUTH-06 | Construir tela de gestão de usuários (Admin cria, edita, desativa usuários e define perfil)
- [ ] AUTH-07 | Testar fluxo completo de login/logout/recuperação de senha — login testado ponta a ponta (Puppeteer); falta UI de logout e AUTH-03 (recuperação de senha) para fechar este item

---

## MÓDULO 1 — Pipeline Comercial / Kanban (PIPE)

`[depende de: DB-03, DB-06, DB-08, AUTH-04, AUTH-05, PREP-11]`

- [x] PIPE-01 | Criar página do quadro Kanban com colunas estáticas (Em análise, Aprovado, Reprovado) — `/pipeline`, colunas vêm de `proposal_statuses` (ver PIPE-13)
- [x] PIPE-02 | Buscar propostas do banco e renderizar como cards nas colunas correspondentes — `src/modules/pipeline/queries.ts`
- [x] PIPE-03 | Instalar e configurar @dnd-kit
- [x] PIPE-04 | Implementar drag-and-drop de cards entre colunas
- [x] PIPE-05 | Persistir mudança de Status no banco ao soltar o card em outra coluna — Server Action `updateProposalStatus`, com rollback otimista em caso de erro
- [x] PIPE-06 | Criar componente de Card exibindo: nº proposta, empresa, valor, serviço
- [x] PIPE-07 | Implementar etiqueta visual de Termômetro (Frio/Morno/Quente) com esquema de cores definido — reaproveita o `Badge` do PREP-11
- [ ] PIPE-08 | Criar modal/página de detalhe da proposta (todos os campos + observações)
- [ ] PIPE-09 | Criar formulário de nova proposta, acessível direto do quadro
- [ ] PIPE-10 | Implementar validação do padrão do nº de proposta (NNN/AA, com suporte a sufixo ".1")
- [ ] PIPE-11 | Criar formulário de edição de proposta existente
- [ ] PIPE-12 | Implementar campo de Observações como histórico (log de alterações com data/autor) — tabela `propostas_historico` já existe (DB-03); falta UI
- [x] PIPE-13 | Preparar estrutura para permitir criação de novas colunas de Status no futuro — colunas vêm da tabela `proposal_statuses`, não são hardcoded
- [ ] PIPE-14 | Testes funcionais do módulo: criar, mover, editar e excluir proposta — só "mover" testado até aqui (Puppeteer, com persistência confirmada após reload); criar/editar/excluir dependem de PIPE-08/09/11
- [ ] PIPE-15 | Testes de responsividade do quadro Kanban em mobile/tablet — testado em mobile (scroll horizontal das colunas); falta tablet

---

## MÓDULO 2 — Clientes/Empresas (CLI)

`[depende de: DB-02, DB-04, DB-06, AUTH-04, AUTH-05, PIPE-06]`

- [ ] CLI-01 | Criar página de listagem de clientes
- [ ] CLI-02 | Implementar busca por nome
- [ ] CLI-03 | Implementar filtro por setor
- [ ] CLI-04 | Criar formulário de cadastro de cliente
- [ ] CLI-05 | Criar formulário de edição de cliente
- [ ] CLI-06 | Criar página de detalhe do cliente (dados gerais, contatos, endereço, observações)
- [ ] CLI-07 | Exibir histórico de propostas vinculadas ao cliente (relação 1-N com Propostas)
- [ ] CLI-08 | Implementar registro de histórico de interações (reuniões, contatos, follow-ups)
- [ ] CLI-09 | Testes funcionais do módulo: cadastrar, buscar, filtrar, editar cliente

---

## MÓDULO 3 — Dashboard Comercial (DASH)

`[depende de: PIPE-02, PIPE-05, DB-03 populado com dados reais/seed]`

- [ ] DASH-01 | Definir e escrever queries agregadas (valor total, aprovado, em análise, reprovado)
- [ ] DASH-02 | Criar componentes de KPI card
- [ ] DASH-03 | Implementar cálculo de percentuais de conversão e reprovação
- [ ] DASH-04 | Criar gráfico de propostas por status
- [ ] DASH-05 | Criar gráfico de propostas por mês
- [ ] DASH-06 | Implementar filtro por período (data inicial/final)
- [ ] DASH-07 | Implementar filtro por tipo de serviço (Fixo/Spot)
- [ ] DASH-08 | Construir visualização de funil de vendas
- [ ] DASH-09 | Construir ranking/insights das propostas mais relevantes
- [ ] DASH-10 | Implementar lógica de analytics/previsão de receita
- [ ] DASH-11 | Testes funcionais do Dashboard (validar números batendo com dados de origem)
- [ ] DASH-12 | Testes de responsividade dos gráficos em mobile/tablet

---

## MÓDULO 4 — Calendário (CAL)

`[depende de: DB-05, DB-06, AUTH-04, AUTH-05]`

- [ ] CAL-01 | Criar página de calendário com visualização mensal
- [ ] CAL-02 | Adicionar visualização semanal/diária
- [ ] CAL-03 | Criar formulário de novo compromisso
- [ ] CAL-04 | Implementar visualização compartilhada entre todos os usuários
- [ ] CAL-05 | Implementar edição de compromisso existente
- [ ] CAL-06 | Implementar exclusão de compromisso
- [ ] CAL-07 | Testes funcionais do módulo Calendário

---

## Funcionalidades Transversais do MVP (TRANS)

`[depende de: PIPE-08, AUTH-06]`

- [ ] TRANS-01 | Avaliar e escolher biblioteca de geração de PDF (react-pdf ou server-side)
- [ ] TRANS-02 | Criar template visual do PDF da proposta comercial
- [ ] TRANS-03 | Implementar geração de PDF a partir dos dados do card/proposta
- [ ] TRANS-04 | Configurar serviço de e-mail transacional (Resend ou SMTP)
- [ ] TRANS-05 | Criar template de e-mail de notificação de mudança de status
- [ ] TRANS-06 | Implementar trigger de envio automático ao mudar status para Aprovado/Reprovado
- [ ] TRANS-07 | Documentar/preparar estrutura de integração futura com WhatsApp (sem implementar)
- [ ] TRANS-08 | Testes funcionais: geração de PDF e disparo de e-mail

---

## QA e Ajustes Gerais do MVP (QA)

`[depende de: PIPE, CLI, DASH, CAL, TRANS concluídos]`

- [ ] QA-01 | Revisão de responsividade em todos os módulos (mobile, tablet, desktop)
- [ ] QA-02 | Testes de permissões cruzados (Admin vs Comercial em cada módulo)
- [ ] QA-03 | Testes de integração entre módulos (ex: proposta aprovada aparece no Dashboard e no histórico do Cliente)
- [ ] QA-04 | Revisão de acessibilidade básica (contraste, navegação por teclado, labels)
- [ ] QA-05 | Ajustes de performance (otimização de queries, lazy loading, cache)
- [ ] QA-06 | Revisão geral de UX conforme pendências levantadas durante o desenvolvimento

---

## Identidade Visual Final (BRAND)

`[depende de: PEND-01]`

- [ ] BRAND-01 | Receber arquivos de logo e paleta oficial da Granvale
- [ ] BRAND-02 | Atualizar variáveis de cor no Tailwind com a paleta oficial
- [ ] BRAND-03 | Substituir componente de Logo placeholder pelo logo oficial
- [ ] BRAND-04 | Revisão visual geral do sistema com a identidade definitiva

---

## Deploy e Entrega (DEPLOY)

`[depende de: QA concluído, BRAND concluído]`

- [ ] DEPLOY-01 | Configurar ambiente de produção no Supabase (apartado do ambiente de dev)
- [ ] DEPLOY-02 | Configurar domínio e deploy final de produção na Vercel
- [ ] DEPLOY-03 | Rodar testes finais em ambiente de produção
- [ ] DEPLOY-04 | Preparar documentação/treinamento rápido para a equipe da Granvale
- [ ] DEPLOY-05 | Go-live do MVP

---

## FASE 2 — Planejamento de Schema (não implementar) (F2)

`[pode ser feito em paralelo, a qualquer momento após DB-06]`

- [ ] F2-01 | Modelar schema de Agendamento de tarefas e prazos
- [ ] F2-02 | Modelar schema de Frota/Veículos (cadastro, documentação, manutenção)
- [ ] F2-03 | Modelar schema de Armazenagem (posições, paletes, ocupação)
- [ ] F2-04 | Modelar schema de Contratos/Documentos (com versionamento)
- [ ] F2-05 | Validar compatibilidade dos schemas da Fase 2 com as tabelas já existentes do MVP

---

## FASE 3 — Planejamento de Schema (não implementar) (F3)

`[depende de: F2 concluído]`

- [ ] F3-01 | Modelar schema do Módulo Financeiro (faturamento, custos, margem por operação)
- [ ] F3-02 | Modelar schema de Notificações/Tarefas avançado (lembretes de follow-up, prazos de BID)

---

## Pendências Externas — dependem da Granvale (PEND)

- [ ] PEND-01 | Enviar logo e paleta de cores oficial (bloqueia BRAND-01)
- [ ] PEND-02 | Decidir se e como importar o histórico da planilha (~80 propostas)
- [ ] PEND-03 | Definir layout/modelo do PDF da proposta comercial (bloqueia TRANS-02)
- [ ] PEND-04 | Confirmar lista de destinatários das notificações por e-mail (bloqueia TRANS-06)

---

## Log de sessões

- **2026-08-06**: Repo criado (branches `main`/`dev`), brief e cronograma commitados, scaffold Next.js + Tailwind gerado via create-next-app e commitado (PREP-01/02/03 concluídos).
- **2026-08-06**: Concluído o restante do PREP (sem depender de contas externas): estrutura de pastas modular (`src/modules/{pipeline,clientes,dashboard,calendario}`, `src/components/{ui,layout,brand}`, `src/lib`), Prettier configurado e integrado ao ESLint, design system provisório em `globals.css` (cores extraídas do logo: navy/grafite/laranja + cores de Termômetro), 7 componentes de UI (`Button`, `Card`, `Input`, `Select`, `Badge`, `Table`, `Modal`), componente `Logo` (usando `public/logo_logihub.png`, recortado/com fundo transparente) e layout base responsivo (`Header` + `Sidebar` + `AppShell`, sidebar fixa no desktop e menu hambúrguer no mobile) dentro do route group `(app)`. Testado com build de produção, lint e screenshots (desktop/mobile, light/dark). PREP-04 a PREP-07 (Supabase/Vercel) seguem pendentes — dependem de contas externas do usuário.
- **2026-08-06**: Conectado ao Supabase — já existia o projeto `CRM_LogiHub` (org Granvale, região us-east-2) criado antes desta sessão; feito o link via `supabase login`/`supabase link` (login rodado pelo usuário em `cmd.exe`, pois o PowerShell bloqueava scripts `.ps1`), API keys obtidas via CLI e gravadas em `.env.local` (fora do git), `.env.example` criado documentando as variáveis. Instalado `@supabase/supabase-js` + `@supabase/ssr`, com clients em `src/lib/supabase/{client,server,middleware}.ts` e refresh de sessão em `src/proxy.ts` (Next 16 renomeou `middleware.ts` → `proxy.ts`, ver BUG-002 em `bugs.md`). Vercel já estava conectado ao repo via GitHub (deploy automático por push) — usuário configurou as 3 env vars do Supabase no dashboard do Vercel e redeployou; validado visualmente pelo usuário no preview `https://crm-gv-git-dev-fabianoalarcon-6118s-projects.vercel.app/` (Vercel Authentication bloqueia acesso externo/curl a previews, então a validação foi feita pelo usuário logado). **FASE 0 (PREP) 100% concluída.**
- **2026-08-06**: Instaladas 3 skills (`frontend-design`, `webapp-testing`, `supabase-postgres-best-practices`) via `npx skills add`, documentadas em `skills.md`.
- **2026-08-06**: Redesign visual (a pedido do usuário, achando o design "fraco/genérico") usando a skill `frontend-design`: adicionada fonte de destaque Space Grotesk (`--font-display`), token de cor `--brand-route` e elemento assinatura `RouteLine` (linha de rota pontilhada com waypoints, ecoando o ícone de circuito do logo) usado no Dashboard conectando os KPIs e na tela de Login. Sidebar ganhou indicador de item ativo com barra lateral em vez de preenchimento total. Criada a tela de Login (`src/app/login`, split-screen navy+branco) com Supabase Auth, e guarda de rota básica no proxy (`src/lib/supabase/middleware.ts`): sem sessão → redireciona para `/login`; logado em `/login` → redireciona para `/` (AUTH-01/02/04 adiantados fora de ordem, ver nota na seção AUTH). Criado usuário de teste via Admin API (`scripts/create-test-user.mjs`, credenciais comunicadas fora deste arquivo). Testado com Puppeteer (instalado só no scratchpad, fora do repo): fluxo de login ponta a ponta, contraste em light/dark, mobile — encontrados e corrigidos BUG-003 (crash inofensivo do Node/libuv no Windows) e BUG-004 (botão primário ilegível no dark mode).
- **2026-08-06**: Login funcionando no Vercel travado (BUG-005, aberto) — adicionado bypass temporário com credencial fixa para não bloquear o desenvolvimento (ver nota na seção AUTH e `bugs.md`). Depois, a pedido do usuário: tema escuro automático (baseado no SO) foi desativado — `dark:` virou variante de classe (`@custom-variant dark`), nunca ativada, então header/conteúdo principal ficam sempre claros independente do tema do sistema operacional; `Sidebar`/`AppShell` passaram a usar navy fixo (não mais `dark:`) para o menu lateral e o painel de marca do login continuarem sempre escuros. Adicionado recolhimento do menu lateral (`AppShell` com estado `isCollapsed`, persistido em `localStorage`): retraído mostra só os ícones (com `title` para acessibilidade), botão de alternância fixo no rodapé da sidebar. Validado com Puppeteer forçando `prefers-color-scheme: dark` do SO para confirmar que a UI não muda mais.
- **2026-08-07**: Modelagem completa do banco (DB-01 a DB-10), usando a skill `supabase-postgres-best-practices` como guia. 8 tabelas em `public`: `profiles` (RBAC, 1-para-1 com `auth.users`, com trigger de auto-criação no signup + backfill do usuário de teste), `proposal_statuses` (colunas do Kanban como tabela, não enum, pensando no PIPE-13), `clientes` + `contatos_cliente`, `propostas` + `propostas_historico` (log do PIPE-12), `interacoes_cliente`, `compromissos`. RLS ativo em todas as tabelas (`private.is_admin()` como helper reutilizável) — Admin e Comercial leem/criam/editam tudo, só Admin remove; validado com `supabase db advisors` (2 achados de segurança corrigidos: `search_path` mutável e `handle_new_user` exposta como RPC pública) e via REST API direta (anon bloqueado, authenticated liberado). Migrations em `supabase/migrations/`, aplicadas com `supabase db push --linked` (não precisa da senha do Postgres, só do login já feito da CLI). Seed fictício em `supabase/seed.sql` (5 clientes, 10 propostas, 3 interações, 3 compromissos, setores Automotivo/Offshore/Químico/Siderúrgico). Integridade validada com joins de 4 tabelas e uma agregação por status (bate com os totais esperados).
- **2026-08-07**: Início do Módulo 1 — Pipeline Comercial (Kanban): board em `/pipeline` com dados reais do banco (`src/modules/pipeline/`), colunas dinâmicas vindas de `proposal_statuses` (PIPE-13), cards com nº/cliente/serviço/valor/termômetro (PIPE-06/07), drag-and-drop com `@dnd-kit` persistindo o status via Server Action com rollback otimista em caso de erro (PIPE-03/04/05). Tipos gerados do banco (`supabase gen types typescript --linked` → `src/lib/supabase/database.types.ts`) e conectados aos clients Supabase para tipagem correta dos joins. Corrigido BUG-007 (mismatch de hidratação do dnd-kit com SSR — board agora carrega via `next/dynamic` com `ssr:false`). **Achado importante sobre o BUG-005**: o bypass de login estava pulando a autenticação real mesmo localmente (onde ela funciona), quebrando o acesso a dados protegidos por RLS — corrigido para sempre tentar o login real primeiro, só usando o bypass como último recurso quando ele falha de fato (nota atualizada em `bugs.md`). Testado com Puppeteer: renderização com dados reais, drag-and-drop com persistência confirmada após reload completo, e responsividade mobile (scroll horizontal). PIPE-08 a PIPE-12 (detalhe, formulários de criar/editar, validação do nº de proposta, histórico de observações) ficam para a próxima sessão.
