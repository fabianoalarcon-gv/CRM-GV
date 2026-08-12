import { BoardView } from "@/modules/pipeline/components/BoardView";
import { NewProposalButton } from "@/modules/pipeline/components/NewProposalButton";
import { ProposalCard } from "@/modules/pipeline/components/ProposalCard";
import { ProposalListView } from "@/modules/pipeline/components/ProposalListView";
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
import { PIPELINE_STATUS_KEYS } from "@/modules/pipeline/types";

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

  const columnStatuses = statuses.filter((s) =>
    (PIPELINE_STATUS_KEYS as readonly string[]).includes(s.key),
  );

  return (
    <PipelineDataProvider
      value={{ statuses, clientes, profiles, history, contatosPrincipais, proximosCompromissos }}
    >
      <div className="flex h-full flex-col gap-6">
        <BoardView
          title="Pipeline"
          subtitle="Arraste os cards entre as colunas para atualizar o status da proposta."
          initialPropostas={propostas}
          columnStatuses={columnStatuses}
          CardComponent={ProposalCard}
          ListComponent={ProposalListView}
          newButton={<NewProposalButton key="new-proposal-button" columnStatuses={columnStatuses} />}
        />
      </div>
    </PipelineDataProvider>
  );
}
