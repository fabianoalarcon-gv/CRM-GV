import { DashboardView } from "@/modules/dashboard/components/DashboardView";
import {
  getDashboardAcoes,
  getDashboardPropostas,
  getDashboardStatusHistorico,
  getStatusLabels,
} from "@/modules/dashboard/queries";

export default async function Home() {
  const [propostas, statusLabels, acoes, statusHistorico] = await Promise.all([
    getDashboardPropostas(),
    getStatusLabels(),
    getDashboardAcoes(),
    getDashboardStatusHistorico(),
  ]);

  return (
    <DashboardView
      propostas={propostas}
      statusLabels={statusLabels}
      acoes={acoes}
      statusHistorico={statusHistorico}
    />
  );
}
