import { BoardClient } from "@/modules/pipeline/components/BoardClient";
import { getProposalStatuses, getPropostas } from "@/modules/pipeline/queries";

export default async function PipelinePage() {
  const [statuses, propostas] = await Promise.all([getProposalStatuses(), getPropostas()]);

  return (
    <div className="flex h-full flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">
          Pipeline
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          Pipeline Comercial
        </h1>
        <p className="mt-1 text-sm text-brand-graphite-light">
          Arraste os cards entre as colunas para atualizar o status da proposta.
        </p>
      </div>

      <BoardClient statuses={statuses} initialPropostas={propostas} />
    </div>
  );
}
