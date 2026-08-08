import { BoardClient } from "@/modules/pipeline/components/BoardClient";
import { NewProposalButton } from "@/modules/pipeline/components/NewProposalButton";
import { PipelineDataProvider } from "@/modules/pipeline/context";
import {
  getClientesOptions,
  getContatosPrincipais,
  getProfileOptions,
  getProposalHistory,
  getProposalStatuses,
  getPropostas,
  getProximosCompromissos,
} from "@/modules/pipeline/queries";

export default async function PipelinePage() {
  const [statuses, propostas, clientes, profiles, history, contatosPrincipais, proximosCompromissos] =
    await Promise.all([
      getProposalStatuses(),
      getPropostas(),
      getClientesOptions(),
      getProfileOptions(),
      getProposalHistory(),
      getContatosPrincipais(),
      getProximosCompromissos(),
    ]);

  return (
    <PipelineDataProvider
      value={{ statuses, clientes, profiles, history, contatosPrincipais, proximosCompromissos }}
    >
      <div className="flex h-full flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">
              Comercial
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
              Pipeline
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
