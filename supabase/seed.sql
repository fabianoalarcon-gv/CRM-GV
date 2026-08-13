-- DB-09: dados fictícios para popular o ambiente de testes (setores reais da
-- planilha: Automotivo, Offshore, Químico, Siderúrgico). Não é idempotente de
-- propósito — script de uso único; rodar de novo duplica os dados.

insert into public.empresas (nome, setor, endereco, observacoes, created_by) values
  ('Metalúrgica Vale Forte S.A.', 'Siderúrgico', 'Av. das Indústrias, 1200 - Cubatão/SP', 'Empresa recorrente, negocia contratos fixos anuais.', 'fec22346-6f75-4a0f-96e5-91b1594aff44'),
  ('AutoPeças Rondelli Ltda', 'Automotivo', 'Rod. Anchieta, km 23 - São Bernardo do Campo/SP', null, 'fec22346-6f75-4a0f-96e5-91b1594aff44'),
  ('Offshore Brasil Exploração S.A.', 'Offshore', 'Av. Rio Branco, 85 - Rio de Janeiro/RJ', 'Exige NR-37 para toda a operação portuária.', 'fec22346-6f75-4a0f-96e5-91b1594aff44'),
  ('Química Solvex Indústria', 'Químico', 'Polo Petroquímico, Lote 14 - Camaçari/BA', null, 'fec22346-6f75-4a0f-96e5-91b1594aff44'),
  ('TransCargas Log Nordeste', 'Automotivo', 'BR-101, km 45 - Cabo de Santo Agostinho/PE', 'Em expansão para o Nordeste, potencial de contrato spot recorrente.', 'fec22346-6f75-4a0f-96e5-91b1594aff44');

insert into public.contatos_empresa (empresa_id, nome, cargo, email, telefone)
select id, 'Marcos Vieira', 'Gerente de Suprimentos', 'marcos.vieira@valeforte.com.br', '(13) 3345-1200'
from public.empresas where nome = 'Metalúrgica Vale Forte S.A.'
union all
select id, 'Renata Dias', 'Compradora', 'compras@rondelli.com.br', '(11) 4123-5566'
from public.empresas where nome = 'AutoPeças Rondelli Ltda'
union all
select id, 'Carlos Andrade', 'Coordenador Logístico', 'candrade@offshorebrasil.com', '(21) 3234-9090'
from public.empresas where nome = 'Offshore Brasil Exploração S.A.'
union all
select id, 'Juliana Prado', 'Gerente de Operações', 'juliana.prado@solvex.ind.br', '(71) 3555-8800'
from public.empresas where nome = 'Química Solvex Indústria'
union all
select id, 'Pedro Lima', 'Diretor Comercial', 'pedro.lima@transcargas.com.br', '(81) 3521-4477'
from public.empresas where nome = 'TransCargas Log Nordeste';

insert into public.propostas (
  numero_proposta, data_envio, empresa_id, servico, descricao, valor,
  status_id, termometro, tipo_servico, responsavel_id, created_by
)
select
  v.numero_proposta, v.data_envio::date, c.id, v.servico, v.descricao, v.valor,
  s.id, v.termometro, v.tipo_servico,
  'fec22346-6f75-4a0f-96e5-91b1594aff44', 'fec22346-6f75-4a0f-96e5-91b1594aff44'
from (values
  ('012/26', '2026-01-12', 'Metalúrgica Vale Forte S.A.', 'Armazenagem', 'Armazenagem de bobinas de aço em galpão dedicado.', 185000.00, 'aprovado', 'quente', 'fixo'),
  ('013/26', '2026-01-15', 'AutoPeças Rondelli Ltda', 'Transportes', 'Transporte rodoviário de autopeças para montadoras da região.', 42000.00, 'em_analise', 'morno', 'spot'),
  ('014/26', '2026-01-20', 'Offshore Brasil Exploração S.A.', 'Serviços Logísticos', 'Suporte logístico portuário para embarque de equipamentos.', 310000.00, 'em_analise', 'quente', 'fixo'),
  ('015/26', '2026-01-22', 'Química Solvex Indústria', 'Locação de Equipamentos', 'Locação de empilhadeiras para pátio industrial.', 27500.00, 'reprovado', 'frio', 'spot'),
  ('016/26', '2026-02-03', 'TransCargas Log Nordeste', 'Intralogística', 'Gestão intralogística de centro de distribuição.', 96000.00, 'em_analise', 'morno', 'fixo'),
  ('017/26', '2026-02-10', 'Metalúrgica Vale Forte S.A.', 'Transportes', 'Frete dedicado para exportação via porto de Santos.', 210000.00, 'aprovado', 'quente', 'fixo'),
  ('017/26.1', '2026-02-18', 'Metalúrgica Vale Forte S.A.', 'Transportes', 'Revisão da proposta 017/26 com escopo ampliado.', 245000.00, 'em_analise', 'quente', 'fixo'),
  ('018/26', '2026-02-21', 'Offshore Brasil Exploração S.A.', 'Armazenagem', 'Armazenagem temporária de equipamentos de perfuração.', 158000.00, 'reprovado', 'morno', 'spot'),
  ('019/26', '2026-03-02', 'AutoPeças Rondelli Ltda', 'Serviços Logísticos', 'Milk-run entre fornecedores e linha de montagem.', 68000.00, 'aprovado', 'quente', 'fixo'),
  ('020/26', '2026-03-05', 'TransCargas Log Nordeste', 'Locação de Equipamentos', 'Locação de veículos de carga para operação sazonal.', 33000.00, 'em_analise', 'frio', 'spot')
) as v(numero_proposta, data_envio, empresa_nome, servico, descricao, valor, status_key, termometro, tipo_servico)
join public.empresas c on c.nome = v.empresa_nome
join public.proposal_statuses s on s.key = v.status_key;

insert into public.propostas_historico (proposta_id, autor_id, texto)
select p.id, 'fec22346-6f75-4a0f-96e5-91b1594aff44', h.texto
from (values
  ('012/26', 'Reunião de alinhamento realizada em 14/01 — empresa aprovou escopo.'),
  ('014/26', 'Aguardando retorno do jurídico da empresa sobre cláusulas de NR-37.'),
  ('017/26.1', 'Empresa pediu revisão de valores após aumento de volume mensal.')
) as h(numero_proposta, texto)
join public.propostas p on p.numero_proposta = h.numero_proposta;

insert into public.interacoes_empresa (empresa_id, autor_id, tipo, descricao, data_interacao)
select c.id, 'fec22346-6f75-4a0f-96e5-91b1594aff44', i.tipo, i.descricao, i.data_interacao::timestamptz
from (values
  ('Metalúrgica Vale Forte S.A.', 'reuniao', 'Visita técnica ao galpão para dimensionar armazenagem.', '2026-01-10 14:00:00-03'),
  ('Offshore Brasil Exploração S.A.', 'ligacao', 'Alinhamento sobre exigências de segurança portuária (NR-37).', '2026-01-18 10:30:00-03'),
  ('AutoPeças Rondelli Ltda', 'follow_up', 'Follow-up sobre proposta de milk-run, empresa pediu ajuste de rota.', '2026-02-25 09:00:00-03')
) as i(empresa_nome, tipo, descricao, data_interacao)
join public.empresas c on c.nome = i.empresa_nome;

insert into public.compromissos (titulo, descricao, inicio, fim, empresa_id, criado_por)
select cp.titulo, cp.descricao, cp.inicio::timestamptz, cp.fim::timestamptz, c.id,
  'fec22346-6f75-4a0f-96e5-91b1594aff44'
from (values
  ('Reunião comercial - Vale Forte', 'Apresentação da revisão da proposta 017/26.1.', '2026-03-10 10:00:00-03', '2026-03-10 11:00:00-03', 'Metalúrgica Vale Forte S.A.'),
  ('Visita técnica - Offshore Brasil', 'Vistoria do pátio para dimensionar armazenagem de equipamentos.', '2026-03-12 09:00:00-03', '2026-03-12 12:00:00-03', 'Offshore Brasil Exploração S.A.'),
  ('Follow-up - TransCargas', 'Ligação de follow-up sobre proposta de intralogística.', '2026-03-14 15:00:00-03', '2026-03-14 15:30:00-03', 'TransCargas Log Nordeste')
) as cp(titulo, descricao, inicio, fim, empresa_nome)
join public.empresas c on c.nome = cp.empresa_nome;
