import { HelpTooltip } from "@/components/ui/HelpTooltip";
import { CaptacaoBoardSection } from "@/modules/captacao/components/CaptacaoBoardSection";
import { getCaptacoes } from "@/modules/captacao/queries";
import { getEmpresasOptions } from "@/modules/pipeline/queries";

export default async function CaptacaoPage() {
  const [captacoes, empresas] = await Promise.all([getCaptacoes(), getEmpresasOptions()]);

  return (
    <div className="flex h-full flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">
          Comercial
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          Captação
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-brand-graphite-light">
          <span>
            Empresas cadastradas aguardando virar Lead{" "}
            <span className="font-semibold">
              · {captacoes.length}{" "}
              {captacoes.length === 1 ? "captação registrada" : "captações registradas"}
            </span>
          </span>
          <HelpTooltip text="Registros dos últimos 90 dias carregados na tela. Caso queira trazer todos os registros de uma só vez, basta selecionar o X nos filtros, ou utilizar o filtro de data conforme a necessidade." />
        </p>
      </div>

      <CaptacaoBoardSection captacoes={captacoes} empresas={empresas} />
    </div>
  );
}
