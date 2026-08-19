-- Motivo de reprovação passa a ser selecionado de uma lista fixa em vez de
-- texto livre. `motivo_reprovacao` guarda a CHAVE da opção escolhida (ex:
-- "tarifa_alta", "outro"); este novo campo guarda o detalhe livre (até 50
-- caracteres) só quando a opção escolhida é "Outro" — registros antigos
-- (texto livre, de antes desta migration) continuam intactos e são tratados
-- como "Outro" na aplicação (ver resolveMotivoReprovacaoInicial).

alter table public.propostas
  add column motivo_reprovacao_detalhe text;

comment on column public.propostas.motivo_reprovacao_detalhe is
  'Detalhe livre (até 50 caracteres) quando motivo_reprovacao = ''outro''.';
