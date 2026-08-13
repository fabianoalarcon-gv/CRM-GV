import { NewProposalButton } from "@/modules/pipeline/components/NewProposalButton";
import { PipelineBoardSection } from "@/modules/pipeline/components/PipelineBoardSection";
import { ProposalCard } from "@/modules/pipeline/components/ProposalCard";
import { ProposalListView } from "@/modules/pipeline/components/ProposalListView";
import { PipelineDataProvider } from "@/modules/pipeline/context";
import {
  getEmpresasOptions,
  getContatosPrincipais,
  getProfileOptions,
  getProposalHistory,
  getProposalStatuses,
  getPropostas,
  getProximosCompromissos,
} from "@/modules/pipeline/queries";
import { PIPELINE_STATUS_KEYS } from "@/modules/pipeline/types";
import { getCompromissos } from "@/modules/calendario/queries";

export default async function PipelinePage() {
  const [statuses, propostas, empresas, profiles, history, contatosPrincipais, proximosCompromissos, compromissos] =
    await Promise.all([
      getProposalStatuses(),
      getPropostas(),
      getEmpresasOptions(),
      getProfileOptions(),
      getProposalHistory(),
      getContatosPrincipais(),
      getProximosCompromissos(),
      getCompromissos(),
    ]);

  const columnStatuses = statuses.filter((s) =>
    (PIPELINE_STATUS_KEYS as readonly string[]).includes(s.key),
  );

  return (
    <PipelineDataProvider
      value={{ statuses, empresas, profiles, history, contatosPrincipais, proximosCompromissos, compromissos }}
    >
      <div className="flex h-full flex-col gap-6">
        <PipelineBoardSection
          title="Pipeline"
          subtitle="Mova os cards entre as colunas para alterar seus status."
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
