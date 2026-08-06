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

- [ ] DB-01 | Modelar tabela Usuários e tabela de Perfis/Roles (Admin, Comercial + reservar Operações/Financeiro)
- [ ] DB-02 | Modelar tabela Clientes/Empresas (nome, setor, contatos, endereço, observações)
- [ ] DB-03 | Modelar tabela Propostas (todos os campos da planilha: nº proposta, data, valor, status, termômetro, tipo, descrição, observações)
- [ ] DB-04 | Modelar tabela Histórico de Interações (vinculada a Clientes)
- [ ] DB-05 | Modelar tabela Compromissos (vinculada a Usuários, para o Calendário)
- [ ] DB-06 | Definir e criar chaves estrangeiras: Propostas↔Clientes, Propostas↔Usuários, Interações↔Clientes, Compromissos↔Usuários
- [ ] DB-07 | Escrever migrations SQL de todas as tabelas acima
- [ ] DB-08 | Configurar Row Level Security (RLS) por perfil de usuário em cada tabela
- [ ] DB-09 | Criar script de seed com dados fictícios (setores: Automotivo, Offshore, Químico, Siderúrgico etc.)
- [ ] DB-10 | Validar integridade referencial rodando queries de teste (joins entre as tabelas)

---

## Autenticação e Permissões (AUTH)

`[depende de: DB-01, DB-08]`

- [ ] AUTH-01 | Configurar Supabase Auth com login por e-mail/senha
- [ ] AUTH-02 | Construir tela de Login
- [ ] AUTH-03 | Construir tela de recuperação de senha
- [ ] AUTH-04 | Implementar middleware/guard de proteção de rotas autenticadas
- [ ] AUTH-05 | Implementar lógica de RBAC no frontend (mostrar/ocultar ações por perfil)
- [ ] AUTH-06 | Construir tela de gestão de usuários (Admin cria, edita, desativa usuários e define perfil)
- [ ] AUTH-07 | Testar fluxo completo de login/logout/recuperação de senha

---

## MÓDULO 1 — Pipeline Comercial / Kanban (PIPE)

`[depende de: DB-03, DB-06, DB-08, AUTH-04, AUTH-05, PREP-11]`

- [ ] PIPE-01 | Criar página do quadro Kanban com colunas estáticas (Em análise, Aprovado, Reprovado)
- [ ] PIPE-02 | Buscar propostas do banco e renderizar como cards nas colunas correspondentes
- [ ] PIPE-03 | Instalar e configurar @dnd-kit
- [ ] PIPE-04 | Implementar drag-and-drop de cards entre colunas
- [ ] PIPE-05 | Persistir mudança de Status no banco ao soltar o card em outra coluna
- [ ] PIPE-06 | Criar componente de Card exibindo: nº proposta, empresa, valor, serviço
- [ ] PIPE-07 | Implementar etiqueta visual de Termômetro (Frio/Morno/Quente) com esquema de cores definido
- [ ] PIPE-08 | Criar modal/página de detalhe da proposta (todos os campos + observações)
- [ ] PIPE-09 | Criar formulário de nova proposta, acessível direto do quadro
- [ ] PIPE-10 | Implementar validação do padrão do nº de proposta (NNN/AA, com suporte a sufixo ".1")
- [ ] PIPE-11 | Criar formulário de edição de proposta existente
- [ ] PIPE-12 | Implementar campo de Observações como histórico (log de alterações com data/autor)
- [ ] PIPE-13 | Preparar estrutura para permitir criação de novas colunas de Status no futuro
- [ ] PIPE-14 | Testes funcionais do módulo: criar, mover, editar e excluir proposta
- [ ] PIPE-15 | Testes de responsividade do quadro Kanban em mobile/tablet

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
