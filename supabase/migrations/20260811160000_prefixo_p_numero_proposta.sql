-- Número da Proposta gerado a partir de um Lead passa a seguir o mesmo
-- conceito do Número do Lead (LNNN/AA), trocando o prefixo por "P"
-- (PNNN/AA) — só o formato de saída muda, o contador continua o mesmo.
create or replace function public.gerar_numero_proposta()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  proximo_numero integer;
begin
  insert into public.proposta_number_counters (ano, ultimo_numero)
  values (extract(year from now())::integer, 1)
  on conflict (ano) do update
    set ultimo_numero = public.proposta_number_counters.ultimo_numero + 1
  returning ultimo_numero into proximo_numero;

  return 'P' || lpad(proximo_numero::text, 3, '0') || '/' || to_char(now(), 'YY');
end;
$$;
