import {
  getClientesOptions,
  getProposalHistory,
  getProposalStatuses,
  getPropostas,
  getProximosCompromissos,
} from "@/modules/pipeline/queries";
import { LEADS_STATUS_KEYS } from "@/modules/pipeline/types";
import { getCompromissos } from "@/modules/calendario/queries";
import { LeadsDataProvider } from "@/modules/leads/context";
import { LeadCard } from "@/modules/leads/components/LeadCard";
import { LeadListView } from "@/modules/leads/components/LeadListView";
import { LeadsBoardSection } from "@/modules/leads/components/LeadsBoardSection";
import { NewLeadButton } from "@/modules/leads/components/NewLeadButton";

export default async function LeadsPage() {
  const [statuses, propostas, clientes, history, compromissos, proximosCompromissos] = await Promise.all([
    getProposalStatuses(),
    getPropostas(),
    getClientesOptions(),
    getProposalHistory(),
    getCompromissos(),
    getProximosCompromissos(),
  ]);

  const columnStatuses = statuses.filter((s) =>
    (LEADS_STATUS_KEYS as readonly string[]).includes(s.key),
  );

  return (
    <LeadsDataProvider
      value={{ statuses: columnStatuses, clientes, history, compromissos, proximosCompromissos }}
    >
      <div className="flex h-full flex-col gap-6">
        <LeadsBoardSection
          title="Leads"
          subtitle="Mova os cards entre as colunas para alterar seus status."
          initialPropostas={propostas}
          columnStatuses={columnStatuses}
          CardComponent={LeadCard}
          ListComponent={LeadListView}
          newButton={<NewLeadButton key="new-lead-button" />}
          itemLabel={{ singular: "lead", plural: "leads", empty: "Nenhum lead nesta coluna." }}
        />
      </div>
    </LeadsDataProvider>
  );
}
