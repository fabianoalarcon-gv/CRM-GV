-- Marca qual atualização (patch) é a "Versão Atual" oficial do sistema, pra
-- exibir isso no menu Atualizações. No máximo uma por vez — garantido por
-- índice único parcial (não só validado na aplicação, senão duas requisições
-- concorrentes poderiam deixar duas marcadas ao mesmo tempo).
alter table public.atualizacoes
  add column versao_atual boolean not null default false;

create unique index atualizacoes_versao_atual_unica_idx
  on public.atualizacoes (versao_atual)
  where versao_atual = true;
