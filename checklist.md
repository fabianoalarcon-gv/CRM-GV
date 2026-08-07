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

- [x] AUTH-01 | Configurar Supabase Auth com login por e-mail/senha
- [x] AUTH-02 | Construir tela de Login
- [x] AUTH-03 | Construir tela de recuperação de senha — `/esqueci-senha` (solicita link via `resetPasswordForEmail`) + `/redefinir-senha` (define nova senha, `updateUser`); rotas liberadas no middleware sem exigir sessão
- [x] AUTH-04 | Implementar middleware/guard de proteção de rotas autenticadas — guarda básica (logado/deslogado) em `src/lib/supabase/middleware.ts`, agora também bloqueando usuário com `profiles.is_active = false` (sign-out forçado + redirect com mensagem, ver AUTH-06)
- [x] AUTH-05 | Implementar lógica de RBAC no frontend (mostrar/ocultar ações por perfil) — perfil do usuário logado exposto via `CurrentUserProvider`/`useCurrentUser` (`src/lib/auth/`), consumido no `Header` (nome/perfil reais) e no `ProposalDetailModal` (botão "Excluir" só para Admin, espelhando a RLS de `propostas_delete` que já era admin-only)
- [x] AUTH-06 | Construir tela de gestão de usuários (Admin cria, edita, desativa usuários e define perfil) — `/usuarios` (admin-only, guarda no servidor + item de menu condicional), `src/modules/usuarios/`: convite por e-mail (`auth.admin.inviteUserByEmail`, via client admin server-only `src/lib/supabase/admin.ts`), edição de perfil e de status (ativo/inativo) inline na tabela; toda action valida no servidor que quem chama é Admin (`requireAdmin`), independente da UI
- [x] AUTH-07 | Testar fluxo completo de login/logout/recuperação de senha — UI de logout adicionada (dropdown no avatar do `Header`); fluxo completo testado com Puppeteer: login, logout, RBAC (Comercial sem acesso a `/usuarios`), convite/edição/desativação de usuário, bloqueio de login de usuário inativo (com reativação depois), e recuperação de senha ponta a ponta usando um link real gerado via Admin API (`generateLink`, sem depender de caixa de e-mail) — encontrado e corrigido BUG-009 nesse teste

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
- [x] PIPE-08 | Criar modal/página de detalhe da proposta (todos os campos + observações) — `ProposalDetailModal`, abre ao clicar no card
- [x] PIPE-09 | Criar formulário de nova proposta, acessível direto do quadro — botão "+ Nova proposta" no cabeçalho
- [x] PIPE-10 | Implementar validação do padrão do nº de proposta (NNN/AA, com suporte a sufixo ".1") — `src/modules/pipeline/validation.ts`, validado no form e de novo na Server Action
- [x] PIPE-11 | Criar formulário de edição de proposta existente — mesmo `ProposalForm`, acessado pelo botão "Editar" no modal de detalhe
- [x] PIPE-12 | Implementar campo de Observações como histórico (log de alterações com data/autor) — lista + formulário de nova observação no modal de detalhe, gravando em `propostas_historico`
- [x] PIPE-13 | Preparar estrutura para permitir criação de novas colunas de Status no futuro — colunas vêm da tabela `proposal_statuses`, não são hardcoded
- [x] PIPE-14 | Testes funcionais do módulo: criar, mover, editar e excluir proposta — todos testados via Puppeteer (criar com validação de número duplicado/inválido, mover com persistência após reload, editar valor, excluir com confirmação via DB), com dado de teste limpo do banco depois
- [x] PIPE-15 | Testes de responsividade do quadro Kanban em mobile/tablet — testado em mobile (scroll horizontal das colunas) e agora também em tablet retrato (768×1024) e paisagem (1024×768), incluindo o modal de detalhe; sem quebras de layout

---

## MÓDULO 2 — Clientes/Empresas (CLI)

`[depende de: DB-02, DB-04, DB-06, AUTH-04, AUTH-05, PIPE-06]`

- [x] CLI-01 | Criar página de listagem de clientes — `/clientes`, tabela com nome/setor/endereço/data de cadastro
- [x] CLI-02 | Implementar busca por nome — filtro client-side por substring (case-insensitive)
- [x] CLI-03 | Implementar filtro por setor — `Select` com opções derivadas dinamicamente dos setores presentes nos clientes cadastrados
- [x] CLI-04 | Criar formulário de cadastro de cliente — `ClienteForm` (nome/setor/endereço/observações) em modal via botão "+ Novo cliente" no cabeçalho de `/clientes`
- [x] CLI-05 | Criar formulário de edição de cliente — mesmo `ClienteForm`, acessado pelo botão "Editar" na página de detalhe
- [x] CLI-06 | Criar página de detalhe do cliente (dados gerais, contatos, endereço, observações) — `/clientes/[id]`, com endereço/observações/data de cadastro, lista de contatos + formulário de adicionar contato (`contatos_cliente`), e exclusão restrita a Admin (espelha a RLS `clientes_delete`)
- [x] CLI-07 | Exibir histórico de propostas vinculadas ao cliente (relação 1-N com Propostas) — card "Propostas vinculadas" na página de detalhe, lendo `propostas` filtrado por `cliente_id` (nº, status, termômetro, data, valor), somente leitura
- [x] CLI-08 | Implementar registro de histórico de interações (reuniões, contatos, follow-ups) — card "Interações" na página de detalhe, lista + formulário de registro (tipo + descrição) gravando em `interacoes_cliente`
- [x] CLI-09 | Testes funcionais do módulo: cadastrar, buscar, filtrar, editar cliente — cobertos ao longo das sessões do CLI-01 ao CLI-08 (ver notas abaixo); nenhum bug novo encontrado

---

## MÓDULO 3 — Dashboard Comercial (DASH)

`[depende de: PIPE-02, PIPE-05, DB-03 populado com dados reais/seed]`

- [x] DASH-01 | Definir e escrever queries agregadas (valor total, aprovado, em análise, reprovado) — `getDashboardPropostas` busca todas as propostas com join de status/cliente; agregação em `computeStatusAggregates` (client-side, dataset pequeno, mesmo padrão de Clientes/Pipeline)
- [x] DASH-02 | Criar componentes de KPI card — `KpiCard` (padrão stat-tile), linha de 4 KPIs (total/em análise/aprovado/reprovado)
- [x] DASH-03 | Implementar cálculo de percentuais de conversão e reprovação — `computeConversionRates` (aprovadas/reprovadas ÷ decididas), KPIs dedicados
- [x] DASH-04 | Criar gráfico de propostas por status — `StatusBarChart`, barras horizontais por status com paleta validada pela skill `dataviz` (`scripts/validate_palette.js`, WARN de separação CVD vermelho/verde mitigado com rótulo direto em todo item, nunca só cor)
- [x] DASH-05 | Criar gráfico de propostas por mês — `MonthlyBarChart`, colunas por mês (valor) com rótulo direto no topo
- [x] DASH-06 | Implementar filtro por período (data inicial/final) — inputs de data no `DashboardView`, filtragem client-side
- [x] DASH-07 | Implementar filtro por tipo de serviço (Fixo/Spot) — `Select` no mesmo painel de filtros
- [x] DASH-08 | Construir visualização de funil de vendas — `SalesFunnel`, 3 estágios monotonicamente decrescentes (enviadas → em análise ou aprovadas → aprovadas), single-hue sequencial
- [x] DASH-09 | Construir ranking/insights das propostas mais relevantes — `RankingTable`, top 5 por valor
- [x] DASH-10 | Implementar lógica de analytics/previsão de receita — `computeForecast`: valor aprovado + (valor em análise × taxa de conversão histórica); cai para 50% como estimativa neutra quando ainda não há propostas decididas (deixado explícito na legenda do KPI)
- [x] DASH-11 | Testes funcionais do Dashboard (validar números batendo com dados de origem) — testado com Puppeteer: KPIs, taxas, previsão e gráficos conferidos batendo entre si e com uma query direta ao banco (`propostas` agrupado por status); filtro por período validado contra a soma manual de um mês; encontrado e corrigido um bug real (rótulo de status caía pra chave crua — `em_analise` em vez de "Em análise" — quando o filtro zerava os resultados)
- [x] DASH-12 | Testes de responsividade dos gráficos em mobile/tablet — testado em 768px e 390px via Puppeteer, sem quebras de layout

---

## MÓDULO 4 — Calendário (CAL)

`[depende de: DB-05, DB-06, AUTH-04, AUTH-05]`

- [x] CAL-01 | Criar página de calendário com visualização mensal — `/calendario`, grade de 6 semanas com os compromissos do dia
- [x] CAL-02 | Adicionar visualização semanal/diária — alternador Mês/Semana/Dia no cabeçalho, com navegação anterior/hoje/próximo adaptada ao modo ativo
- [x] CAL-03 | Criar formulário de novo compromisso — `CompromissoForm` (título/início/fim/cliente opcional/descrição) em modal, acessível pelo botão "+ Novo compromisso" ou clicando num dia vazio
- [x] CAL-04 | Implementar visualização compartilhada entre todos os usuários — sem filtro por usuário; RLS de `compromissos` já libera select/insert/update/delete para qualquer autenticado (equipe pequena, agenda compartilhada)
- [x] CAL-05 | Implementar edição de compromisso existente — mesmo `CompromissoForm`, acessado pelo botão "Editar" no modal de detalhe
- [x] CAL-06 | Implementar exclusão de compromisso — botão "Excluir" no modal de detalhe, com confirmação inline (sem restrição de perfil, ver CAL-04)
- [x] CAL-07 | Testes funcionais do módulo Calendário — testado com Puppeteer: navegação até os compromissos do seed (mar/2026), abrir detalhe, criar/editar/excluir refletindo na UI sem reload manual (compromissos passam direto da Server Component via prop, sem cópia em estado local), visões mês/semana/dia; sem erros de console

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
- **2026-08-07**: Completado o restante do Módulo 1 (PIPE-08 a PIPE-12/14), a pedido do usuário (deixando o BUG-005 propositalmente pendente pra depois). Modal de detalhe (`ProposalDetailModal`) abre ao clicar no card, mostra todos os campos + histórico de observações, com formulário pra adicionar nova observação (`propostas_historico`) e botões Editar/Excluir (exclusão com confirmação inline). Formulário de proposta (`ProposalForm`) compartilhado entre criar (botão "+ Nova proposta" no cabeçalho) e editar, com validação do nº da proposta (`validation.ts`, regex `NNN/AA` + sufixo opcional) tanto no cliente quanto na Server Action; erro de número duplicado (constraint única do banco) vira mensagem amigável. Dados de referência (clientes, perfis, status, histórico) ficam num Context (`PipelineDataProvider`) compartilhado entre o cabeçalho da página e os cards, evitando prop drilling. Novo componente `Textarea` em `src/components/ui/`. `Modal` ganhou `max-h-[90vh] overflow-y-auto` (fixa um limite de altura que faltava, para caber formulário + histórico em telas menores). Testado com Puppeteer: criar (com validação de formato inválido e de número duplicado), editar (valor refletido no card), excluir (confirmado direto no banco), adicionar observação — todos os fluxos funcionando ponta a ponta; dados de teste removidos do banco depois. Nenhum bug novo encontrado nesta rodada (os problemas de digitação em campo numérico durante os testes eram do script de automação, não da aplicação).
- **2026-08-07**: `dev` mesclado em `main` (fast-forward, primeiro push de `main` pro GitHub) a pedido do usuário, pra ir pra produção. Em seguida, **BUG-005 resolvido**: causa raiz era o Site URL do Supabase Auth travado em `http://localhost:3000` com Redirect URLs vazio — usuário adicionou as URLs do Vercel em Authentication > URL Configuration, confirmado via `curl` simulando o header `Origin` do domínio do Vercel e depois pelo usuário logando de verdade no deploy. Bypass temporário removido por completo (`src/lib/dev-bypass.ts` deletado, `src/app/login/page.tsx` e `src/lib/supabase/middleware.ts` voltaram a só usar o Supabase Auth real). Ver `bugs.md` para detalhes completos.
- **2026-08-07**: Login ainda falhava especificamente na URL de produção real (`https://crm-gv.vercel.app/`, diferente do preview `crm-gv-git-dev-...`) — **BUG-008**, causa totalmente diferente do BUG-005. Usuário inspecionou a requisição via DevTools > Network: `NEXT_PUBLIC_SUPABASE_URL` no ambiente **Production** do Vercel estava com `/rest/v1` sobrando no valor, fazendo o login cair na API REST em vez da API de Auth (erro `PGRST125`). Corrigido pelo usuário no Vercel (Production ≠ Preview têm variáveis de ambiente separadas) e redeploy feito. Login confirmado funcionando em produção. Nenhum bug em aberto no momento (ver `bugs.md`).
- **2026-08-07**: Fechados os itens soltos de AUTH e PIPE-15. **PIPE-15**: Kanban testado em tablet retrato/paisagem, sem quebras. **UI de logout**: avatar do `Header` virou um dropdown (fecha ao clicar fora) com a opção "Sair" (`supabase.auth.signOut()`). **AUTH-03**: `/esqueci-senha` (solicita link, mensagem genérica pra não vazar quais e-mails existem) e `/redefinir-senha` (define nova senha), ambas liberadas no middleware sem exigir sessão. **AUTH-04/06**: `profiles.is_active` (existia na tabela mas nunca era checado) agora é aplicado no middleware — usuário desativado é deslogado e redirecionado com mensagem; nova tela `/usuarios` (admin-only, com guarda no servidor e item de menu condicional a `useIsAdmin`) usa um client Supabase server-only com a service role key (`src/lib/supabase/admin.ts`, nunca importado por código client) pra listar (`auth.admin.listUsers` + `profiles`), convidar (`inviteUserByEmail`) e editar perfil/status; toda Server Action valida no servidor que quem chama é Admin (`requireAdmin`), não confia só na UI escondida. **AUTH-07**: fluxo completo testado com Puppeteer — login/logout, RBAC (Comercial redirecionado de `/usuarios`), convite+edição+desativação+reativação de usuário, bloqueio de login de conta inativa, e recuperação de senha ponta a ponta usando um link real gerado via `supabase.auth.admin.generateLink` (evita depender de caixa de e-mail real ou do domínio fictício `logihub.dev`, que o Supabase rejeita para envio de convite — achado documentado, não é bug). Nesse teste foi encontrado e corrigido o **BUG-009**: o client SSR do Supabase (`@supabase/ssr`) não faz o parse automático do fragmento `#access_token=...` do link de recuperação (diferente do client "puro"), então `/redefinir-senha` sempre mostrava "link inválido"; corrigido fazendo `setSession` manual a partir do hash. Usuários de teste criados durante a sessão removidos depois; senha do usuário admin de teste resetada de volta pro valor conhecido. `npm run build`/`lint` limpos. **AUTH-01 a AUTH-07 e PIPE-15 100% concluídos** — com isso, todo o MVP (PREP, DB, AUTH, PIPE, CLI, DASH, CAL) está com os itens de desenvolvimento fechados; restam só QA geral, BRAND, DEPLOY e as pendências externas da Granvale (ver `PEND` no cronograma).
- **2026-08-07**: Módulo 3 — Dashboard Comercial (**DASH-01 a DASH-12**) implementado por completo, fechando o módulo. Página inicial (`/`, `src/app/(app)/page.tsx`) trocou os KPIs estáticos placeholder por dados reais via novo módulo `src/modules/dashboard/`. `DashboardView` (client) recebe todas as propostas do servidor e filtra localmente por período/tipo de serviço (mesmo padrão client-side já usado em Clientes/Pipeline). Antes de escrever qualquer gráfico, usada a skill `dataviz`: paleta de status (azul "Em análise" reaproveitado de `--temp-frio`, verde novo "Aprovado" — `--status-aprovado` em `globals.css` —, vermelho "Reprovado" reaproveitado de `--temp-quente`) validada com `scripts/validate_palette.js` (WARN de separação CVD entre verde/vermelho — dentro da faixa aceitável desde que nunca dependa só da cor; por isso todo elemento colorido por status leva rótulo de texto direto, nunca só a cor). Gráficos construídos à mão em SVG/Tailwind (sem nova dependência de biblioteca de charts) seguindo os specs da skill (barras ≤24px, cantos arredondados, rótulos diretos, grid recessivo): `StatusBarChart` (barras horizontais por status), `MonthlyBarChart` (colunas por mês), `SalesFunnel` (3 estágios monotonicamente decrescentes: enviadas → em análise/aprovadas → aprovadas) e `RankingTable` (top 5 propostas por valor, reaproveitando o `Table` do design system). Previsão de receita (DASH-10) como heurística simples e declarada na própria UI: valor aprovado + (valor em análise × taxa de conversão histórica), caindo para 50% quando ainda não há propostas decididas. **Achado relevante**: ao validar os números batendo com a origem (DASH-11), percebido que os status reais das propostas no banco já não batem mais com `supabase/seed.sql` — testes anteriores do Pipeline (drag-and-drop entre colunas) alteraram permanentemente o `status_id` de propostas reais do seed sem reverter depois; os valores atuais (Em análise R$ 401.500/4, Aprovado R$ 252.000/2, Reprovado R$ 721.000/4) são os corretos a usar como referência daqui pra frente, não os do arquivo `seed.sql`. Isso não é um bug do Dashboard (os números batem certinho com uma query direta ao banco), só um lembrete de que `seed.sql` descreve o estado *inicial*, não o atual. Um bug real foi encontrado e corrigido durante o teste: com o filtro zerando os resultados, o gráfico de status mostrava a chave crua do banco (`em_analise`) em vez do rótulo (“Em análise”) — corrigido calculando o mapa de rótulos a partir da lista completa (não filtrada) de propostas. Testado com Puppeteer em desktop/tablet(768px)/mobile(390px), sem erros de console e sem quebras de layout. `npm run build`/`lint` limpos. **Módulo 3 (DASH) 100% concluído.**
- **2026-08-07**: Início de um redesign visual do frontend (fora do cronograma formal — não é o BRAND-01/02, que é sobre aplicar a identidade *oficial* da Granvale; isso é uma repaginação geral, começando pela tela de Login). A pedido do usuário, que enviou um HTML de referência (gerado por outra ferramenta, estilo "Material") pra usar como nova direção visual completa, não só como inspiração de layout. Decisão explícita do usuário via pergunta direta: substituir a paleta/tipografia atual, não conviver as duas. Trocada a fonte de corpo/mono de Geist para **Inter** + **JetBrains Mono** (`next/font/google`, `src/app/layout.tsx`); Space Grotesk mantido como `--font-display` (não usado na nova tela de login, mas não removido do resto do app). Adicionado o sistema de ícones **Material Symbols Outlined** via `<link>` no `<head>` do layout raiz (não tem equivalente no catálogo do `next/font/google`), com um componente `Icon` novo em `src/components/ui/`. Tokens de cor em `globals.css` ajustados pra tons mais próximos do M3 (navy `#131b2e`, laranja `#d95f00`, fundo `#f8f9ff`, borda `#d5d9e3`) — mantendo a mesma família navy+laranja da marca, então o impacto visual nas outras telas (Sidebar, Dashboard, Pipeline, Clientes) foi sutil, não um rebrand chocante (validado com Puppeteer, sem regressões). O componente `Input` compartilhado ganhou um prop `icon` opcional e retrocompatível (sem `icon`, nenhuma outra tela muda). Tela de login reconstruída: ícones dentro dos campos (mail/lock), "Lembrar de mim" (checkbox visual por enquanto — **não** liga a persistência de sessão ainda, ver nota abaixo), link "Esqueceu a senha?" ao lado do label, botão "Entrar no Sistema" com seta. **Não** usada a imagem de fundo hotlinked do exemplo (`lh3.googleusercontent.com/...`, um preview do Google AI Studio) — é um asset instável/possivelmente efêmero pra depender num app real; mantido o padrão de pontos + gradiente sobre navy já usado antes. **Nota técnica registrada em comentário no código**: a persistência de sessão do Supabase (`@supabase/ssr`) neste projeto é baseada em cookies (não em `localStorage`), então diferenciar "lembrar de mim" exigiria controlar o `maxAge` do cookie — não implementado nesta rodada pra não arriscar quebrar login por engano; o checkbox por enquanto é só visual. Testado com Puppeteer em desktop/mobile e conferido visualmente Dashboard/Pipeline/Clientes/Esqueci-senha pós-mudança de tokens, sem erros de console. `npm run build`/`lint` limpos. Restante do app (Sidebar, Header, Dashboard, Pipeline, Clientes, Calendário, Usuários) ainda não foi redesenhado — usuário vai mandar mais referências pra próximas telas.
- **2026-08-07**: Módulo 4 — Calendário (**CAL-01 a CAL-07**) implementado por completo. Novo módulo `src/modules/calendario/` (mesmo padrão dos demais: `types`/`queries`/`actions`/`components`) com página `/calendario` (`CalendarioView`) trazendo três visões (Mês em grade de 6 semanas, Semana em cards por dia, Dia em lista), navegação anterior/hoje/próximo adaptada ao modo ativo, criação de compromisso (clicando em "+ Novo compromisso" ou num dia vazio) e detalhe/edição/exclusão via `CompromissoDetailModal` (mesmo padrão editar-inline dos módulos Pipeline/Clientes). Sem RBAC — RLS de `compromissos` já libera tudo pra qualquer autenticado (agenda compartilhada da equipe, CAL-04). Decisão de implementação: ao contrário do `Board` do Pipeline (que guarda uma cópia local dos dados em `useState` por causa do drag-and-drop otimista), o `CalendarioView` usa a prop `compromissos` vinda do Server Component diretamente, sem cópia local — isso garante que criar/editar/excluir apareçam na tela imediatamente após o `revalidatePath`, sem precisar de reload manual (validado no teste). Testado com Puppeteer: navegação até os compromissos reais do seed (março/2026, já que hoje é agosto/2026), abertura de detalhe, criar → editar → excluir refletindo sem reload, troca entre as três visões — tudo sem erros de console; dado de teste removido do banco depois. `npm run build`/`lint` limpos de primeira. **Módulo 4 (CAL) 100% concluído.**
- **2026-08-07**: Completado o Módulo 2 — Clientes (**CLI-07/08/09**), fechando o módulo. Card "Propostas vinculadas" na página de detalhe (`getPropostasByCliente`, somente leitura, reaproveitando o mesmo join com `proposal_statuses` do Pipeline) e card "Interações" (`getInteracoesByCliente`/`addInteracao`, tipo pré-definido — reunião/ligação/e-mail/follow-up/outro — + descrição, mesmo padrão de log usado em contatos e no histórico de propostas). Testado com Puppeteer num cliente do seed com propostas reais (Metalúrgica Vale Forte S.A.): propostas vinculadas exibidas corretamente e nova interação registrada e exibida sem erros de console; dado de teste removido do banco depois. **CLI-09** (testes funcionais gerais) considerado coberto pelos testes já rodados ao longo do CLI-01 ao CLI-08 nesta e na sessão anterior (cadastrar, buscar, filtrar, editar, ver detalhe, contatos, propostas, interações, excluir com RBAC) — nenhum bug novo encontrado. `npm run build`/`lint` limpos. **Módulo 2 (CLI) 100% concluído.**
- **2026-08-07**: Completado **CLI-04/05/06** do Módulo 2. `ClienteForm` compartilhado entre criar (`NewClienteButton`, modal a partir do cabeçalho de `/clientes`) e editar (a partir da página de detalhe). Nova página `/clientes/[id]` (`ClienteDetailView`) mostra endereço/observações/data de cadastro, lista de contatos (`contatos_cliente`) com formulário de adicionar contato (`addContato`), e botão "Excluir" restrito a Admin (`useIsAdmin`), espelhando a policy `clientes_delete` do RLS (mesmo padrão do PIPE/AUTH-05). Linhas da tabela de `/clientes` agora navegam para a página de detalhe (`router.push`, já que `<tr>` não aceita `<a>` como filho direto). Testado com Puppeteer: fluxo completo criar → abrir detalhe → editar → adicionar contato → excluir (Admin) funcionando ponta a ponta sem erros de console; confirmado também que o usuário Comercial não vê o botão Excluir no detalhe. Dados de teste removidos do banco depois. `npm run build`/`lint` limpos. Restam CLI-07 (histórico de propostas do cliente), CLI-08 (histórico de interações) e CLI-09 (testes) pra próxima sessão.
- **2026-08-07**: Início do Módulo 2 — Clientes/Empresas (**CLI-01/02/03**): página `/clientes` (`src/modules/clientes/`, mesmo padrão do Pipeline: `queries.ts` + componente client) listando nome/setor/endereço/data de cadastro, com busca por nome e filtro por setor (opções derivadas dinamicamente dos clientes cadastrados) — ambos client-side, mesmo padrão de filtragem já usado no board do Pipeline. Testado com Puppeteer: 5 clientes do seed carregando corretamente, busca por "auto" e filtro "Automotivo" retornando o resultado esperado, sem erros no console. `npm run build`/`lint` limpos. Restam CLI-04 a CLI-09 (formulários de cadastro/edição, página de detalhe, histórico de propostas/interações, testes) pra próxima sessão.
- **2026-08-07**: **AUTH-05** (RBAC no frontend) implementado. Novo módulo `src/lib/auth/` com `getCurrentUser()` (server, junta `auth.users` + `profiles`) e `CurrentUserProvider`/`useCurrentUser`/`useIsAdmin` (client), plugado no `(app)/layout.tsx` (agora async) envolvendo o `AppShell`. `Header` deixou de mostrar o avatar placeholder "U" e passou a exibir nome + perfil reais do usuário logado. No Pipeline, o botão "Excluir" do `ProposalDetailModal` agora só aparece para `role === 'admin'` — espelha no frontend a policy `propostas_delete` do RLS (que já era admin-only desde o DB-08), então a regra de negócio não mudou, só passou a ser refletida na UI. Testado com Puppeteer: criado usuário comercial de teste (`comercial-teste@logihub.dev`, role padrão do trigger) e resetada a senha do admin de teste (`teste@logihub.dev`, "credenciais comunicadas fora deste arquivo" — nova senha também comunicada fora deste arquivo) só pra rodar o teste; confirmado visualmente (screenshot) que Admin vê nome "Admin" + botão Excluir, Comercial vê nome "Comercial" sem o botão. Usuário de teste comercial removido do banco depois; usuário admin de teste mantido (mesma conta reaproveitada de sessões anteriores). `npm run build` e `npm run lint` limpos.
