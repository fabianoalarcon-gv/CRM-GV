# PROMPT MESTRE — Construção do Sistema LogiHub

> Cole este documento inteiro para a IA de desenvolvimento (Claude Code, Lovable, bolt.new, v0, etc.) para iniciar a construção do projeto. Ele foi desenhado para ser **modular**: cada módulo pode ser solicitado separadamente em prompts futuros, reaproveitando o mesmo contexto e modelo de dados.
>
> **Atualizado em 2026-08-25**: este era originalmente o prompt de partida do projeto (2026-08-06); a seção 6 (roadmap) e a seção 9 (pendências) foram atualizadas pra refletir o sistema como ele existe hoje, já em uso em produção e bem além do MVP inicial. Para o detalhamento tarefa-a-tarefa de cada módulo (incluindo os que vieram depois do MVP), ver `docs/cronograma.md`; para o histórico completo de decisões sessão a sessão, ver o log no fim de `docs/checklist.md`.

---

## 1. CONTEXTO DO PROJETO

Você vai me ajudar a construir o **LogiHub**, um sistema CRM web para a **Granvale Logística e Transportes**, empresa do setor de **Logística, Transportes e Armazenagem**.

O sistema substituirá controles hoje feitos em planilhas Excel (propostas comerciais, cotações spot) por uma plataforma web centralizada, modular e responsiva.

**Princípio de arquitetura obrigatório: MODULARIDADE.**
Cada módulo (Pipeline Comercial, Clientes, Dashboard, Frota, Armazenagem, etc.) deve:
- Ter suas próprias tabelas/schema isolado no banco de dados (com relacionamentos claros via chaves estrangeiras).
- Ter seus próprios componentes de UI em pastas separadas.
- Poder ser ativado/desativado ou evoluído sem quebrar os demais módulos.
- Compartilhar apenas serviços transversais: autenticação, usuários/permissões, layout base e componentes de UI reutilizáveis (botões, cards, tabelas).

---

## 2. STACK TECNOLÓGICA

- **Frontend:** Next.js (React), com Tailwind CSS para estilização.
- **Responsividade:** obrigatória — o sistema deve funcionar bem em desktop, tablet e celular (mobile-first ou adaptativo, com breakpoints testados).
- **Backend / Banco de dados:** Supabase (PostgreSQL + Auth + Storage + Realtime).
- **Autenticação:** Supabase Auth, com login por e-mail/senha (sem redes sociais nesta fase).
- **Hospedagem:** Vercel (frontend) + Supabase Cloud (banco/backend).
- **Drag-and-drop (Kanban):** biblioteca `@dnd-kit` (ou `react-beautiful-dnd` como alternativa) para o módulo de Pipeline Comercial.
- **Geração de PDF:** biblioteca para gerar propostas comerciais em PDF a partir dos dados do sistema (ex: `react-pdf` ou geração server-side).
- **Notificações:** e-mail transacional (ex: Resend ou Supabase + serviço SMTP) e estrutura preparada para futura integração com WhatsApp (via API, ex: Twilio ou similar) — não implementar WhatsApp nesta fase, apenas deixar a arquitetura pronta.

**Adicionado depois do MVP inicial** (ver `docs/cronograma.md`, módulos NOTIF/PARAM, pra detalhes):
- **Monitoramento de erro:** Sentry (`@sentry/nextjs`), captura client + server + edge, mesmo projeto pra produção e Dev (diferenciados por tag `environment`).
- **E-mail transacional:** implementado via SMTP/`nodemailer` (não Resend), com modo teste configurável.
- **Sincronização de agenda:** Google Calendar, via Service Account com delegação de domínio (Workspace da Granvale), sincroniza toda Ação criada/editada/excluída no CRM.
- **Backup:** cron diário exportando snapshot JSON de todas as tabelas pra um projeto Supabase separado (não é um serviço de backup nativo/pago).

---

## 3. IDENTIDADE VISUAL

A empresa é a **Granvale Logística e Transportes**. Vou fornecer o **logo e a paleta de cores oficial da empresa** em uma etapa seguinte — a IA deve estruturar o design system (variáveis de cor no Tailwind, componente de logo, tema) de forma que seja fácil substituir esses valores assim que eu enviar os arquivos de marca. Até lá, use uma paleta profissional para o setor de logística (tons de azul-marinho, cinza-grafite e um destaque em laranja ou amarelo, transmitindo confiança e movimento).

---

## 4. USUÁRIOS E PERMISSÕES

- Equipe comercial pequena (até 5 pessoas) nesta fase inicial.
- Perfis de acesso:
  - **Admin/Gestor:** acesso total, vê todas as propostas e dashboards, gerencia usuários.
  - **Comercial:** cria e edita propostas, move cards no pipeline, cadastra clientes, vê todas as propostas e dashboards
  - (Deixar o modelo de permissões (RBAC) já preparado no banco para adicionar perfis futuros como Operações e Financeiro, mesmo que não usados ainda.)

---

## 5. MODELO DE DADOS BASE (extraído da planilha atual da empresa)

A empresa hoje controla propostas em uma planilha Excel com os seguintes campos — use isso como referência para o schema do módulo de Pipeline Comercial:

| Campo | Tipo | Observação |
|---|---|---|
| Número da proposta | texto | ex: "028/25", com padrão NNN/AA (pode ter sufixos como ".1") |
| Data de envio | data | |
| Empresa (cliente) | texto/FK | relacionar com tabela de Clientes |
| Setor do cliente | texto | ex: Automotivo, Offshore, Químico, Siderúrgico |
| Serviço | texto/enum | Armazenagem, Transportes, Intralogística, Locação de Equipamentos, Serviços Logísticos, etc. |
| Descrição resumida | texto longo | |
| Valor concorrido (R$) | numérico | |
| Status | enum | Em análise / Aprovado / Reprovado (= colunas do Kanban) |
| Termômetro | enum | Frio / Morno / Quente (etiqueta de temperatura da negociação) |
| Tipo de serviço | enum | Fixo / Spot |
| Observações | texto longo | histórico de negociação, datas de reunião, etc. |

Além disso, a planilha mantém um **painel resumo** com: valor total, valor "em análise", valor aprovado, valor reprovado, e os respectivos percentuais, e a contagem de propostas por status. **Isso deve virar o módulo de Dashboard.**

---

## 6. MÓDULOS — ROADMAP

### 🎯 FASE 1 — MVP (construir primeiro)

**Módulo 1: Pipeline Comercial (Kanban)**
- Quadro estilo Trello com colunas = Status (Em análise, Aprovado, Reprovado — permitir adicionar novas colunas no futuro).
- Cards arrastáveis (drag-and-drop) entre colunas; mover o card atualiza o Status no banco.
- Cada card exibe: nº da proposta, empresa, valor, serviço, e uma etiqueta colorida de Termômetro (🔴 Frio azul-claro / 🟡 Morno amarelo / 🔴 Quente vermelho — definir esquema de cor).
- Clique no card abre modal/página de detalhe com todos os campos + observações + histórico.
- Criação de nova proposta direto do quadro.

**Módulo 2: Clientes/Empresas**
- Cadastro de empresas (nome, setor, contatos, endereço, observações).
- Relacionamento 1-para-muitos com Propostas (histórico de propostas por cliente).
- Historico de interaçoes.
- Busca e filtro por setor.

**Módulo 3: Dashboard Comercial**
- KPIs: valor total em propostas, valor aprovado, valor em análise, valor reprovado.
- Percentuais de conversão e reprovação.
- Gráfico de propostas por status e por mês.
- Filtro por período e por tipo (Fixo/Spot).
- Funil de vendas.
- Insights das propostas mais ranqueadas.
- Analytics com previsoes de receitas e dados relevantes

**Módulo 4: Calendário**
- Calendário que mostra os compromissos.
- Permitir incluir um novo compromisso, e todos os usuarios poderao visualizar.

**Transversal ao MVP:**
- Autenticação (Supabase Auth) e controle de acesso por perfil.
- Geração de PDF da proposta a partir dos dados do card.
- Notificação por e-mail quando uma proposta muda de status (ex: avisa o responsável quando é Aprovada/Reprovada).

### ✅ Módulos construídos depois do MVP inicial (não previstos neste prompt original)

Cinco módulos adicionais nasceram de necessidades reais da equipe já usando o sistema, fora do escopo original acima. Detalhamento tarefa-a-tarefa em `docs/cronograma.md` (siglas CAPT/LEAD/NOTIF/ATUAL/PARAM).

**Captação** — inbox de empresas recém-cadastradas ainda sem Lead, com filtros e indicador de conversão no Dashboard; "Transformar em Lead" alimenta o módulo abaixo.

**Leads** — funil inicial da venda (Prospecção → Qualificação → Arquivado), antes de virar uma Proposta numerada no Pipeline — tecnicamente a mesma tabela de Propostas, só num estágio anterior. Numeração própria (`L001/26`), Ações (compromissos) com recorrência, arquivar/reativar, e promoção pra Proposta formal.

**Notificações** — sino no header (todos os usuários) pra eventos do sistema (nova empresa, novo lead/proposta, card movido, aprovado/reprovado, nova Ação), mais um scan diário de itens "esquecidos" (sem movimentação/contato/ação) e reativação automática de Lead arquivado há muito tempo. Cada evento pode também disparar e-mail, com liga/desliga por tipo e modo de teste.

**Atualizações** — changelog interno do próprio sistema (não é feature de negócio do CRM): o Admin documenta o que mudou em cada versão/patch, com rastreio opcional de nº de chamado; todo usuário vê as novidades por um ícone no header.

**Parâmetros** — painel central de configuração pro Admin (thresholds de notificação, e-mail, retomada de Lead arquivado, Google Calendar), mais o log de auditoria de ações administrativas (convites/edições/exclusões de usuário, exclusão de Proposta/Lead/Empresa) e o backup diário — esses dois últimos sem tela própria, mas administrados por ali perto.

### 🚛 FASE 2 (planejar schema, não implementar ainda)
- Módulo de Agendamento de tarefas e prazos
- Módulo de Frota/Veículos (cadastro, documentação, manutenção).
- Módulo de Armazenagem (posições, paletes, ocupação).
- Módulo de Contratos/Documentos (contratos assinados, versionamento).

### 💰 FASE 3 (planejar schema, não implementar ainda)
- Módulo Financeiro (faturamento, custos, margem por operação).
- Módulo de Notificações/Tarefas avançado (lembretes de follow-up, prazos de BID).

---

## 7. MIGRAÇÃO DE DADOS

Ainda não decidido se o histórico da planilha (≈80 propostas de 2025/2026) será importado. **Não implementar importação automática nesta fase** — apenas garantir que o schema do banco seja compatível com os campos da planilha (ver seção 5), para que uma importação via CSV/script seja simples de fazer depois.

---

## 8. INSTRUÇÕES DE ENTREGA PARA A IA

1. Comece propondo a estrutura de pastas do projeto (modular, por domínio) antes de escrever código.
2. Depois, gere o schema do banco (tabelas Supabase) para os módulos do MVP, com relacionamentos entre Propostas ↔ Clientes ↔ Usuários.
3. Em seguida, construa o módulo de Pipeline Comercial (Kanban) primeiro, por ser o núcleo do sistema.
4. Depois o módulo de Clientes, depois o Dashboard.
5. Sempre que possível, pergunte antes de assumir decisões de UX não especificadas aqui.
6. Use dados fictícios de exemplo (seed) baseados nos setores reais da planilha (Automotivo, Offshore, Químico, Siderúrgico, etc.) para popular o ambiente de testes.

---

## 9. PENDÊNCIAS A RESOLVER COM O USUÁRIO (Granvale)

> Espelha o `PEND` de `docs/cronograma.md` — ver lá pro detalhe de o que cada uma bloqueia.

- [ ] Enviar arquivo de logo e paleta de cores oficial da empresa.
- [ ] Decidir se e como importar o histórico da planilha atual.
- [ ] Definir layout/modelo do PDF da proposta comercial (tem um padrão hoje?).
- [x] Confirmar lista de destinatários para as notificações por e-mail — resolvido pelo modelo implementado: todos os usuários ativos com notificação habilitada, opt-out individual, sem precisar de uma lista curada.
