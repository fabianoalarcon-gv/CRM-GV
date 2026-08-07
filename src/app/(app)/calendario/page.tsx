import { CalendarioView } from "@/modules/calendario/components/CalendarioView";
import { getClienteOptions, getCompromissos } from "@/modules/calendario/queries";

export default async function CalendarioPage() {
  const [compromissos, clientes] = await Promise.all([getCompromissos(), getClienteOptions()]);

  return <CalendarioView compromissos={compromissos} clientes={clientes} />;
}
