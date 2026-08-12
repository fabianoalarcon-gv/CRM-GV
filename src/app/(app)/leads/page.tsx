import { BoardView } from "@/modules/pipeline/components/BoardView";
import { getClientesOptions, getProposalHistory, getProposalStatuses, getPropostas } from "@/modules/pipeline/queries";
import { LEADS_STATUS_KEYS } from "@/modules/pipeline/types";
import { getCompromissos } from "@/modules/calendario/queries";
import { LeadsDataProvider } from "@/modules/leads/context";
import { LeadCard } from "@/modules/leads/components/LeadCard";
import { LeadListView } from "@/modules/leads/components/LeadListView";
import { NewLeadButton } from "@/modules/leads/components/NewLeadButton";

export default async function LeadsPage() {
  const [statuses, propostas, clientes, history, compromissos] = await Promise.all([
    getProposalStatuses(),
    getPropostas(),
    getClientesOptions(),
    getProposalHistory(),
    getCompromissos(),
  ]);

  const columnStatuses = statuses.filter((s) =>
    (LEADS_STATUS_KEYS as readonly string[]).includes(s.key),
  );

  return (
    <LeadsDataProvider value={{ statuses: columnStatuses, clientes, history, compromissos }}>
      <div className="flex h-full flex-col gap-6">
        <BoardView
          title="Leads"
          subtitle="Arraste os cards entre as colunas para atualizar o status do lead."
          initialPropostas={propostas}
          columnStatuses={columnStatuses}
          CardComponent={LeadCard}
          ListComponent={LeadListView}
          newButton={<NewLeadButton key="new-lead-button" />}
        />
      </div>
    </LeadsDataProvider>
  );
}
