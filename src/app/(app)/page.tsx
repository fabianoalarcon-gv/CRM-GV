import { DashboardView } from "@/modules/dashboard/components/DashboardView";
import {
  getDashboardAcoes,
  getDashboardPropostas,
  getDashboardStatusHistorico,
  getStatusLabels,
} from "@/modules/dashboard/queries";
import { getCaptacoes } from "@/modules/captacao/queries";

export default async function Home() {
  const [propostas, statusLabels, acoes, statusHistorico, captacoes] = await Promise.all([
    getDashboardPropostas(),
    getStatusLabels(),
    getDashboardAcoes(),
    getDashboardStatusHistorico(),
    getCaptacoes(),
  ]);

  return (
    <DashboardView
      propostas={propostas}
      statusLabels={statusLabels}
      acoes={acoes}
      statusHistorico={statusHistorico}
      captacoes={captacoes}
    />
  );
}
