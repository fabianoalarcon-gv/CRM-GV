import { DashboardView } from "@/modules/dashboard/components/DashboardView";
import { getDashboardPropostas, getStatusLabels } from "@/modules/dashboard/queries";

export default async function Home() {
  const [propostas, statusLabels] = await Promise.all([
    getDashboardPropostas(),
    getStatusLabels(),
  ]);

  return <DashboardView propostas={propostas} statusLabels={statusLabels} />;
}
