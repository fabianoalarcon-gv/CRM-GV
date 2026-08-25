# CRONOGRAMA — Construção do Sistema LogiHub

> Este documento detalha, em ordem de dependência, todas as tarefas necessárias para construir o LogiHub, do setup inicial até o go-live do MVP, além do planejamento de schema das Fases 2 e 3. Cada tarefa tem uma **sigla** (grupo + número sequencial) que pode ser usada como referência em commits, board de tarefas (Jira/Trello/Linear) ou prompts futuros para a IA de desenvolvimento.

---

## Como usar este cronograma

- As tarefas estão organizadas em **grupos** (siglas de 2 a 5 letras) e numeradas sequencialmente dentro do grupo.
- A ordem dentro de cada grupo, e a ordem dos grupos entre si, **respeita as dependências técnicas** — ex: não é possível construir o Pipeline Comercial (PIPE) antes do schema de Propostas existir (DB-03) e antes de haver autenticação (AUTH).
- Onde uma tarefa depende de outra fora do seu próprio grupo, isso está indicado entre colchetes `[depende de: ...]`.
- Tarefas de **QA/Testes** aparecem ao final de cada módulo (granularidade menor) e também como uma rodada geral ao final do MVP (granularidade macro).

---

## Legenda de grupos

| Sigla | Grupo |
|---|---|
| PREP | Preparação e Setup Inicial |
| DB | Modelagem de Banco de Dados |
| AUTH | Autenticação e Permissões |
| PIPE | Módulo Pipeline Comercial (Kanban) |
| CLI | Módulo Clientes/Empresas |
| DASH | Módulo Dashboard Comercial |
| CAL | Módulo Calendário |
| CAPT | Módulo Captação (empresas ainda sem Lead) |
| LEAD | Módulo Leads (funil inicial, antes de virar Proposta numerada) |
| NOTIF | Notificações in-app e por e-mail |
| ATUAL | Módulo Atualizações (changelog interno do sistema) |
| PARAM | Parâmetros / Administração (config, auditoria, backup) |
| TUT | Manual do usuário e tutorial in-app |
| TRANS | Funcionalidades Transversais (PDF, E-mail) |
| QA | Testes e Qualidade Geral |
| BRAND | Identidade Visual Final |
| DEPLOY | Deploy e Entrega |
| F2 | Planejamento de Schema — Fase 2 |
| F3 | Planejamento de Schema — Fase 3 |
| PEND | Pendências Externas (dependem do cliente Granvale) |

---

## FASE 0 — Preparação e Setup Inicial (PREP)

Pré-requisito de tudo o que vem depois. Sem infraestrutura básica, nenhum módulo pode começar.

| Sigla | Tarefa |
|---|---|
| PREP-01 | Criar repositório Git e definir estratégia de branches (main/dev/feature) |
| PREP-02 | Inicializar projeto Next.js |
| PREP-03 | Instalar e configurar Tailwind CSS |
| PREP-04 | Criar organização e projeto no Supabase |
| PREP-05 | Configurar variáveis de ambiente (.env local e produção) |
| PREP-06 | Instalar e configurar cliente Supabase no Next.js (auth + db client) |
| PREP-07 | Conectar projeto ao Vercel e validar deploy "hello world" |
| PREP-08 | Definir estrutura de pastas modular por domínio (ex: /modules/pipeline, /modules/clientes) |
| PREP-09 | Configurar ESLint + Prettier + convenções de código |
| PREP-10 | Criar design system base (variáveis de cor provisórias, tipografia, espaçamento no Tailwind) |
| PREP-11 | Criar componentes de UI reutilizáveis: Button, Card, Input, Select, Modal, Badge, Table |
| PREP-12 | Criar componente de Logo (placeholder, pronto para substituição futura) |
| PREP-13 | Criar layout base: header, sidebar de navegação, área de conteúdo, responsivo |

---

## Fundamentos Transversais do MVP

### Banco de Dados (DB)
`[depende de: PREP-04, PREP-05, PREP-06]`

| Sigla | Tarefa |
|---|---|
| DB-01 | Modelar tabela Usuários e tabela de Perfis/Roles (Admin, Comercial + reservar Operações/Financeiro) |
| DB-02 | Modelar tabela Clientes/Empresas (nome, setor, contatos, endereço, observações) |
| DB-03 | Modelar tabela Propostas (todos os campos da planilha: nº proposta, data, valor, status, termômetro, tipo, descrição, observações) |
| DB-04 | Modelar tabela Histórico de Interações (vinculada a Clientes) |
| DB-05 | Modelar tabela Compromissos (vinculada a Usuários, para o Calendário) |
| DB-06 | Definir e criar chaves estrangeiras: Propostas↔Clientes, Propostas↔Usuários, Interações↔Clientes, Compromissos↔Usuários |
| DB-07 | Escrever migrations SQL de todas as tabelas acima |
| DB-08 | Configurar Row Level Security (RLS) por perfil de usuário em cada tabela |
| DB-09 | Criar script de seed com dados fictícios (setores: Automotivo, Offshore, Químico, Siderúrgico etc.) |
| DB-10 | Validar integridade referencial rodando queries de teste (joins entre as tabelas) |

### Autenticação e Permissões (AUTH)
`[depende de: DB-01, DB-08]`

| Sigla | Tarefa |
|---|---|
| AUTH-01 | Configurar Supabase Auth com login por e-mail/senha |
| AUTH-02 | Construir tela de Login |
| AUTH-03 | Construir tela de recuperação de senha |
| AUTH-04 | Implementar middleware/guard de proteção de rotas autenticadas |
| AUTH-05 | Implementar lógica de RBAC no frontend (mostrar/ocultar ações por perfil) |
| AUTH-06 | Construir tela de gestão de usuários (Admin cria, edita, desativa usuários e define perfil) |
| AUTH-07 | Testar fluxo completo de login/logout/recuperação de senha |

---

## MÓDULO 1 — Pipeline Comercial / Kanban (PIPE)
`[depende de: DB-03, DB-06, DB-08, AUTH-04, AUTH-05, PREP-11]`
Núcleo do sistema — construir primeiro entre os módulos de negócio.

| Sigla | Tarefa |
|---|---|
| PIPE-01 | Criar página do quadro Kanban com colunas estáticas (Em análise, Aprovado, Reprovado) |
| PIPE-02 | Buscar propostas do banco e renderizar como cards nas colunas correspondentes |
| PIPE-03 | Instalar e configurar @dnd-kit |
| PIPE-04 | Implementar drag-and-drop de cards entre colunas |
| PIPE-05 | Persistir mudança de Status no banco ao soltar o card em outra coluna |
| PIPE-06 | Criar componente de Card exibindo: nº proposta, empresa, valor, serviço |
| PIPE-07 | Implementar etiqueta visual de Termômetro (Frio/Morno/Quente) com esquema de cores definido |
| PIPE-08 | Criar modal/página de detalhe da proposta (todos os campos + observações) |
| PIPE-09 | Criar formulário de nova proposta, acessível direto do quadro |
| PIPE-10 | Implementar validação do padrão do nº de proposta (NNN/AA, com suporte a sufixo ".1") |
| PIPE-11 | Criar formulário de edição de proposta existente |
| PIPE-12 | Implementar campo de Observações como histórico (log de alterações com data/autor) |
| PIPE-13 | Preparar estrutura para permitir criação de novas colunas de Status no futuro |
| PIPE-14 | Testes funcionais do módulo: criar, mover, editar e excluir proposta |
| PIPE-15 | Testes de responsividade do quadro Kanban em mobile/tablet |

---

## MÓDULO 2 — Clientes/Empresas (CLI)
`[depende de: DB-02, DB-04, DB-06, AUTH-04, AUTH-05, PIPE-06 (para exibir vínculo com propostas)]`

| Sigla | Tarefa |
|---|---|
| CLI-01 | Criar página de listagem de clientes |
| CLI-02 | Implementar busca por nome |
| CLI-03 | Implementar filtro por setor |
| CLI-04 | Criar formulário de cadastro de cliente |
| CLI-05 | Criar formulário de edição de cliente |
| CLI-06 | Criar página de detalhe do cliente (dados gerais, contatos, endereço, observações) |
| CLI-07 | Exibir histórico de propostas vinculadas ao cliente (relação 1-N com Propostas) |
| CLI-08 | Implementar registro de histórico de interações (reuniões, contatos, follow-ups) |
| CLI-09 | Testes funcionais do módulo: cadastrar, buscar, filtrar, editar cliente |

---

## MÓDULO 3 — Dashboard Comercial (DASH)
`[depende de: PIPE-02, PIPE-05, DB-03 populado com dados reais/seed]`

| Sigla | Tarefa |
|---|---|
| DASH-01 | Definir e escrever queries agregadas (valor total, aprovado, em análise, reprovado) |
| DASH-02 | Criar componentes de KPI card |
| DASH-03 | Implementar cálculo de percentuais de conversão e reprovação |
| DASH-04 | Criar gráfico de propostas por status |
| DASH-05 | Criar gráfico de propostas por mês |
| DASH-06 | Implementar filtro por período (data inicial/final) |
| DASH-07 | Implementar filtro por tipo de serviço (Fixo/Spot) |
| DASH-08 | Construir visualização de funil de vendas |
| DASH-09 | Construir ranking/insights das propostas mais relevantes |
| DASH-10 | Implementar lógica de analytics/previsão de receita |
| DASH-11 | Testes funcionais do Dashboard (validar números batendo com dados de origem) |
| DASH-12 | Testes de responsividade dos gráficos em mobile/tablet |

---

## MÓDULO 4 — Calendário (CAL)
`[depende de: DB-05, DB-06, AUTH-04, AUTH-05]`

| Sigla | Tarefa |
|---|---|
| CAL-01 | Criar página de calendário com visualização mensal |
| CAL-02 | Adicionar visualização semanal/diária |
| CAL-03 | Criar formulário de novo compromisso |
| CAL-04 | Implementar visualização compartilhada entre todos os usuários |
| CAL-05 | Implementar edição de compromisso existente |
| CAL-06 | Implementar exclusão de compromisso |
| CAL-07 | Testes funcionais do módulo Calendário |

---

> **Nota (2026-08-25)**: os 5 módulos abaixo (CAPT, LEAD, NOTIF, ATUAL, PARAM) foram construídos em sessões de desenvolvimento que não deixaram registro formal neste cronograma na época — documentados retroativamente nesta data, a partir de uma auditoria completa do código-fonte, todos já implementados e em uso em produção.

## MÓDULO 5 — Captação (CAPT)
`[depende de: DB-02 (empresas), AUTH-04, AUTH-05]`

| Sigla | Tarefa |
|---|---|
| CAPT-01 | Modelar tabela `captacoes` (empresa recém-cadastrada, ainda sem Lead), RLS aberta a qualquer usuário autenticado (não é tela administrativa) |
| CAPT-02 | Criar página `/captacao` com listagem de empresas aguardando qualificação (nome, setor, cidade/UF, origem do lead, se já tem contato registrado) |
| CAPT-03 | Implementar filtros (busca por empresa, período — padrão últimos 90 dias, origem do lead, tem/não tem contato) |
| CAPT-04 | Implementar criação manual de captação e o prompt de criação direto do fluxo de cadastro de nova Empresa |
| CAPT-05 | Implementar exclusão de captação |
| CAPT-06 | Implementar "Transformar em Lead" (gera uma proposta nova em estágio Prospecção e remove a captação) |
| CAPT-07 | Indicadores de Captação no Dashboard (captações por mês; empresas cadastradas sem Lead ainda / taxa de conversão) |

---

## MÓDULO 6 — Leads (LEAD)
`[depende de: PIPE — reaproveita a tabela propostas e o Kanban —, CAPT]`

> Um Lead e uma Proposta são a mesma linha da tabela `propostas` — o que muda é o estágio (`status_id`). A página `/leads` reaproveita o board/lista genéricos do Pipeline, filtrados pros estágios iniciais do funil (Prospecção, Qualificação, Arquivado); `/pipeline` mostra os estágios finais (Proposta, Negociação, Fechado).

| Sigla | Tarefa |
|---|---|
| LEAD-01 | Estender `propostas` pra suportar o estágio de Lead: nº proposta/valor/tipo de serviço passam a ser opcionais, novo campo `numero_lead` (numeração própria por ano, ex. `L001/26`, via trigger com contador atômico), `data_inicio_lead` |
| LEAD-02 | Criar página `/leads`, reaproveitando o board (Kanban) e a visão em lista já usados pelo Pipeline, filtrados pros estágios Prospecção/Qualificação/Arquivado |
| LEAD-03 | Formulário de criar/editar Lead (empresa, descrição, termômetro opcional, segmentos, valor estimado, responsável) |
| LEAD-04 | Timelines de Andamento e Observações (reaproveita o histórico do Pipeline, `propostas_historico`, separado por tipo) |
| LEAD-05 | Registro de Ações (compromissos) vinculadas ao Lead, com recorrência (diária/semanal/mensal/anual/dias úteis) e sincronização individual com o Google Calendar |
| LEAD-06 | Implementar Arquivar/Reativar Lead (estágio reversível — guarda o estágio anterior pra restaurar) |
| LEAD-07 | Implementar "Gerar Proposta" (promove Lead qualificado pra Proposta numerada, gera `numero_proposta`) e "Reverter para Qualificação" (a partir do Pipeline) |
| LEAD-08 | Cron de retomada de Lead arquivado — configurável em Parâmetros (dias + categoria da Ação gerada automaticamente) |
| LEAD-09 | Testes funcionais do módulo: criar, qualificar, registrar Ação, arquivar/reativar, promover a Proposta |

---

## MÓDULO 7 — Notificações (NOTIF)
`[depende de: PIPE, CAL, CLI/empresas, LEAD]`

| Sigla | Tarefa |
|---|---|
| NOTIF-01 | Modelar `notificacoes` (evento central, somente gravado por trigger `security definer`) + `notificacoes_lidas` (leitura por usuário) |
| NOTIF-02 | Sino de notificações no header (todos os usuários, polling, indicador de não lidas, marcar como lida) |
| NOTIF-03 | Triggers automáticos de evento: nova empresa, novo lead, nova proposta, movimentação de card no Kanban, proposta aprovada/reprovada, nova Ação |
| NOTIF-04 | Scan diário de itens "sem movimentação/sem contato/sem ação" (Lead, Proposta, Empresa) — thresholds configuráveis em Parâmetros |
| NOTIF-05 | Envio de e-mail (SMTP/nodemailer) por notificação — liga/desliga geral, remetente configurável, modo teste (redireciona tudo pra um e-mail só) e liga/desliga por tipo de evento |
| NOTIF-06 | Webhook de disparo de e-mail (trigger do Postgres via `pg_net`, autenticado por secret guardado no Vault, comparado com `timingSafeEqual`) |
| NOTIF-07 | Opt-out por usuário (`profiles.email_notifications`) e e-mail de boas-vindas no convite de novo usuário |

---

## MÓDULO 8 — Atualizações (ATUAL)

Changelog interno do próprio sistema (não é uma feature de negócio do CRM) — permite ao Admin documentar o que mudou em cada versão/patch, com rastreio opcional de nº de chamado.

`[depende de: AUTH-06]`

| Sigla | Tarefa |
|---|---|
| ATUAL-01 | Modelar `atualizacoes` (patch/versão) + `atualizacoes_itens` (mudanças por tipo: solicitação/correção/melhoria/inclusão) + `atualizacoes_vistas` (leitura por usuário) |
| ATUAL-02 | Tela admin `/atualizacoes` — criar patch, adicionar/editar/excluir itens de mudança, marcar "versão atual" (único, garantido por índice único no banco) |
| ATUAL-03 | Ícone de novidades no header (todos os usuários, indicador de não lida) + modal "Sobre o app" mostrando a versão atual |

---

## MÓDULO 9 — Parâmetros / Administração (PARAM)

Painel central de configurações que antes eram fixas no código, hoje ajustáveis pelo Admin sem precisar de deploy — mais o log de auditoria e o backup automático (infraestrutura, sem tela própria).

`[depende de: AUTH-06, NOTIF, CAL (Google Calendar), LEAD]`

| Sigla | Tarefa |
|---|---|
| PARAM-01 | Tela admin `/parametros` — RBAC 100% em código (`requireAdmin()` na Server Action + guarda na página), sem policy de escrita na RLS das tabelas de configuração |
| PARAM-02 | Seção de thresholds de notificação (dias sem movimentação/contato/ação) |
| PARAM-03 | Seção de retomada de Lead arquivado (dias + categoria da Ação gerada) |
| PARAM-04 | Seção de e-mail (liga/desliga, remetente, modo teste, tipos de evento habilitados) |
| PARAM-05 | Seção de sincronização com Google Calendar (liga/desliga; sync por Service Account com delegação de domínio, um evento por caixa de e-mail sincronizada) |
| PARAM-06 | Log de auditoria de ações administrativas (`logs_auditoria`, com RLS restrita a Admin de verdade — não só em código) — registra convite/edição/exclusão de usuário e exclusão de Proposta/Lead/Empresa |
| PARAM-07 | Seção de retenção do log de auditoria (dias configuráveis) + cron diário de limpeza automática |
| PARAM-08 | Backup diário automático dos dados de produção pra um projeto Supabase separado (cron, sem UI dedicada) |

---

## MÓDULO 10 — Manual do usuário e Tutorial in-app (TUT)

Documentação orientada a tarefa ("como fazer X"), com print real de cada tela, pensada pro usuário final (não documentação técnica). Feito em duas fases: primeiro o manual em Markdown no repositório, depois uma versão navegável dentro do próprio sistema.

`[depende de: todos os módulos com tela própria (o manual documenta cada um)]`

| Sigla | Tarefa |
|---|---|
| TUT-01 | Manual do usuário em Markdown (`docs/manual/`), um arquivo por módulo (11 no total) com prints reais capturados via Playwright contra o ambiente Dev |
| TUT-02 | Índice do manual (`docs/manual/indice.md`) com a ordem de leitura sugerida |
| TUT-03 | Tutorial in-app: página `/tutorial` (índice) e `/tutorial/[slug]`, lendo os mesmos arquivos Markdown direto do disco (sem duplicar conteúdo num banco) |
| TUT-04 | Rota interna de prints (`/api/tutorial-assets/[...path]`) que serve as imagens de `docs/manual/screenshots/` sem duplicá-las em `public/`, autenticada na mão (fica fora do matcher do proxy.ts) e protegida contra path traversal |
| TUT-05 | Item "Tutorial" no menu lateral, visível pra todos os usuários (Admin e Comercial) |

---

## Funcionalidades Transversais do MVP (TRANS)
`[depende de: PIPE-08 (dados da proposta para o PDF), AUTH-06 (destinatários de e-mail)]`

| Sigla | Tarefa |
|---|---|
| TRANS-01 | Avaliar e escolher biblioteca de geração de PDF (react-pdf ou server-side) |
| TRANS-02 | Criar template visual do PDF da proposta comercial |
| TRANS-03 | Implementar geração de PDF a partir dos dados do card/proposta |
| TRANS-04 | Configurar serviço de e-mail transacional (Resend ou SMTP) — **atendida pelo módulo NOTIF** (SMTP/nodemailer, ver NOTIF-05) |
| TRANS-05 | Criar template de e-mail de notificação de mudança de status — **atendida pelo módulo NOTIF** (templates por tipo de evento, incluindo aprovação/reprovação, ver NOTIF-05/06) |
| TRANS-06 | Implementar trigger de envio automático ao mudar status para Aprovado/Reprovado — **atendida pelo módulo NOTIF** (trigger `propostas_notificar_update` + webhook de e-mail, ver NOTIF-03/06) |
| TRANS-07 | Documentar/preparar estrutura de integração futura com WhatsApp (sem implementar) |
| TRANS-08 | Testes funcionais: geração de PDF e disparo de e-mail |

---

## QA e Ajustes Gerais do MVP (QA)
`[depende de: PIPE, CLI, DASH, CAL, TRANS concluídos]`

| Sigla | Tarefa |
|---|---|
| QA-01 | Revisão de responsividade em todos os módulos (mobile, tablet, desktop) |
| QA-02 | Testes de permissões cruzados (Admin vs Comercial em cada módulo) |
| QA-03 | Testes de integração entre módulos (ex: proposta aprovada aparece no Dashboard e no histórico do Cliente) |
| QA-04 | Revisão de acessibilidade básica (contraste, navegação por teclado, labels) |
| QA-05 | Ajustes de performance (otimização de queries, lazy loading, cache) |
| QA-06 | Revisão geral de UX conforme pendências levantadas durante o desenvolvimento |

---

## Identidade Visual Final (BRAND)
`[depende de: PEND-01 — recebimento do material de marca pelo cliente]`

| Sigla | Tarefa |
|---|---|
| BRAND-01 | Receber arquivos de logo e paleta oficial da Granvale |
| BRAND-02 | Atualizar variáveis de cor no Tailwind com a paleta oficial |
| BRAND-03 | Substituir componente de Logo placeholder pelo logo oficial |
| BRAND-04 | Revisão visual geral do sistema com a identidade definitiva |

---

## Deploy e Entrega (DEPLOY)
`[depende de: QA concluído, BRAND concluído]`

| Sigla | Tarefa |
|---|---|
| DEPLOY-01 | Configurar ambiente de produção no Supabase (apartado do ambiente de dev) |
| DEPLOY-02 | Configurar domínio e deploy final de produção na Vercel |
| DEPLOY-03 | Rodar testes finais em ambiente de produção |
| DEPLOY-04 | Preparar documentação/treinamento rápido para a equipe da Granvale |
| DEPLOY-05 | Go-live do MVP |

---

## FASE 2 — Planejamento de Schema (não implementar) (F2)
`[pode ser feito em paralelo, a qualquer momento após DB-06]`

| Sigla | Tarefa |
|---|---|
| F2-01 | Modelar schema de Agendamento de tarefas e prazos |
| F2-02 | Modelar schema de Frota/Veículos (cadastro, documentação, manutenção) |
| F2-03 | Modelar schema de Armazenagem (posições, paletes, ocupação) |
| F2-04 | Modelar schema de Contratos/Documentos (com versionamento) |
| F2-05 | Validar compatibilidade dos schemas da Fase 2 com as tabelas já existentes do MVP |

---

## FASE 3 — Planejamento de Schema (não implementar) (F3)
`[depende de: F2 concluído, pois módulo Financeiro referencia Frota e Armazenagem]`

| Sigla | Tarefa |
|---|---|
| F3-01 | Modelar schema do Módulo Financeiro (faturamento, custos, margem por operação) |
| F3-02 | Modelar schema de Notificações/Tarefas avançado (lembretes de follow-up, prazos de BID) |

---

## Pendências Externas — dependem da Granvale (PEND)

Essas tarefas não são de desenvolvimento, mas bloqueiam outras tarefas do cronograma até serem resolvidas.

| Sigla | Tarefa | Bloqueia |
|---|---|---|
| PEND-01 | Enviar logo e paleta de cores oficial | BRAND-01 |
| PEND-02 | Decidir se e como importar o histórico da planilha (~80 propostas) | Escopo de uma futura tarefa de importação (fora deste cronograma) |
| PEND-03 | Definir layout/modelo do PDF da proposta comercial | TRANS-02 |
| PEND-04 | Confirmar lista de destinatários das notificações por e-mail | TRANS-06 — **resolvido pelo modelo implementado no NOTIF**: todos os usuários ativos com `email_notifications = true`, opt-out individual em vez de lista curada |

---

## Ordem macro recomendada (visão resumida)

1. **PREP** (setup completo)
2. **DB** → **AUTH** (fundamentos, em paralelo entre si na parte final)
3. **PIPE** (núcleo do sistema)
4. **CLI**
5. **DASH** (depende de dados reais fluindo por PIPE)
6. **CAL** (pode rodar em paralelo com DASH, ambos dependem apenas de AUTH)
7. **CAPT** → **LEAD** (funil inicial, antes da Proposta numerada — construídos depois do MVP original, fora de ordem em relação aos itens abaixo)
8. **NOTIF** (depende de PIPE/CAL/CLI/LEAD já existirem, pra ter o que notificar)
9. **ATUAL** / **PARAM** (administração — podem rodar a qualquer momento após AUTH-06)
9.5. **TUT** (manual do usuário e tutorial in-app — documenta os módulos já construídos, roda depois deles)
10. **TRANS** (PDF e e-mail — parte de e-mail já coberta por NOTIF, resta só a geração de PDF)
11. **QA** (rodada geral)
12. **BRAND** (assim que PEND-01 for resolvida — pode acontecer em paralelo, mas o go-live espera por ela)
13. **DEPLOY**
14. **F2 / F3** — planejamento de schema, sem prazo fixo, pode ser feito em paralelo a qualquer momento após DB-06
