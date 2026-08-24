-- Segmento passa de seleção única (texto) pra múltipla (array de até 3
-- valores fixos): Transporte, Armazenagem, Serviço. "Sem segmento" agora é
-- array vazio em vez de null, evitando null espalhado pelo código.
alter table public.propostas add column segmentos text[] not null default '{}';

update public.propostas
set segmentos = case when segmento is not null then array[segmento] else '{}' end;

alter table public.propostas drop column segmento;

alter table public.propostas add constraint propostas_segmentos_valores check (
  segmentos <@ array['armazenagem', 'servico', 'transporte']::text[]
);
alter table public.propostas add constraint propostas_segmentos_max3 check (
  coalesce(array_length(segmentos, 1), 0) <= 3
);
