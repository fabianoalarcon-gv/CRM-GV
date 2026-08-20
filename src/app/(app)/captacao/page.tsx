import { CaptacaoListView } from "@/modules/captacao/components/CaptacaoListView";
import { NovaCaptacaoButton } from "@/modules/captacao/components/NovaCaptacaoButton";
import { getCaptacoes } from "@/modules/captacao/queries";
import { getEmpresasOptions } from "@/modules/pipeline/queries";

export default async function CaptacaoPage() {
  const [captacoes, empresas] = await Promise.all([getCaptacoes(), getEmpresasOptions()]);

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">
            Comercial
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
            Captação
          </h1>
          <p className="mt-1 text-sm text-brand-graphite-light">
            Empresas cadastradas aguardando virar Lead{" "}
            <span className="font-semibold">
              · {captacoes.length}{" "}
              {captacoes.length === 1 ? "captação registrada" : "captações registradas"}
            </span>
          </p>
        </div>
        <NovaCaptacaoButton empresas={empresas} />
      </div>

      <CaptacaoListView captacoes={captacoes} />
    </div>
  );
}
