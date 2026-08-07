import { BoardClient } from "@/modules/pipeline/components/BoardClient";
import { NewProposalButton } from "@/modules/pipeline/components/NewProposalButton";
import { PipelineDataProvider } from "@/modules/pipeline/context";
import {
  getClientesOptions,
  getProfileOptions,
  getProposalHistory,
  getProposalStatuses,
  getPropostas,
} from "@/modules/pipeline/queries";

export default async function PipelinePage() {
  const [statuses, propostas, clientes, profiles, history] = await Promise.all([
    getProposalStatuses(),
    getPropostas(),
    getClientesOptions(),
    getProfileOptions(),
    getProposalHistory(),
  ]);

  return (
    <PipelineDataProvider value={{ statuses, clientes, profiles, history }}>
      <div className="flex h-full flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
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
          <NewProposalButton />
        </div>

        <BoardClient initialPropostas={propostas} />
      </div>
    </PipelineDataProvider>
  );
}
