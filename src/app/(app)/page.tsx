import { DashboardView } from "@/modules/dashboard/components/DashboardView";
import { getDashboardPropostas } from "@/modules/dashboard/queries";

export default async function Home() {
  const propostas = await getDashboardPropostas();

  return <DashboardView propostas={propostas} />;
}
