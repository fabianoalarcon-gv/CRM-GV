# Manual do usuário: LogiHub CRM

Guia passo a passo de cada tela do sistema, com prints reais. Pensado pra quem usa o CRM no dia a dia (equipe comercial e Admin); não é documentação técnica (essa fica no resto de `docs/`).

## Módulos

Ordem sugerida de leitura, seguindo o fluxo real de trabalho, mas cada arquivo é independente, pode ser lido isolado:

1. [Login e recuperação de senha](login.md)
2. [Captação](captacao.md): empresas recém-cadastradas ainda sem Lead
3. [Leads](leads.md): funil inicial, antes da proposta numerada
4. [Pipeline](pipeline.md): quadro Kanban de propostas
5. [Empresas](empresas.md): cadastro de clientes
6. [Dashboard](dashboard.md): indicadores e gráficos
7. [Calendário](calendario.md): compromissos/Ações
8. [Notificações](notificacoes.md): sino de eventos do sistema
9. [Atualizações](atualizacoes.md): changelog interno
10. [Usuários](usuarios.md): gestão de acesso (Admin)
11. [Parâmetros](parametros.md): configurações do sistema (Admin)

## Convenção

Cada arquivo segue o mesmo formato: uma seção por tarefa (“Como fazer X”), com o print da tela relevante logo abaixo do título, e uma seção final "Quem pode fazer o quê" com as regras de permissão (Admin vs. Comercial). Prints ficam em `screenshots/<modulo>/`, numerados na ordem em que aparecem no texto.

Os prints foram capturados no ambiente **Dev** (banco de teste, isolado de produção; ver `docs/RECUPERACAO-EMERGENCIA.md` e o histórico em `docs/checklist.md` pra mais contexto sobre a separação dev/prod), então nomes de empresas/valores que aparecem são dados fictícios de teste.
