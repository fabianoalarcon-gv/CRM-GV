import { BoardClient } from "@/modules/pipeline/components/BoardClient";
import { getClientesOptions, getProposalHistory, getProposalStatuses, getPropostas } from "@/modules/pipeline/queries";
import { LEADS_STATUS_KEYS } from "@/modules/pipeline/types";
import { getCompromissos } from "@/modules/calendario/queries";
import { LeadsDataProvider } from "@/modules/leads/context";
import { LeadCard } from "@/modules/leads/components/LeadCard";
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
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">
              Comercial
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
              Leads
            </h1>
            <p className="mt-1 text-sm text-brand-graphite-light">
              Arraste os cards entre as colunas para atualizar o status do lead.
            </p>
          </div>
          <NewLeadButton />
        </div>

        <BoardClient initialPropostas={propostas} columnStatuses={columnStatuses} CardComponent={LeadCard} />
      </div>
    </LeadsDataProvider>
  );
}
