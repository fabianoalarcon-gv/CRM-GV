import { CalendarioView } from "@/modules/calendario/components/CalendarioView";
import { getEmpresaOptions, getCompromissos } from "@/modules/calendario/queries";

export default async function CalendarioPage() {
  const [compromissos, empresas] = await Promise.all([getCompromissos(), getEmpresaOptions()]);

  return <CalendarioView compromissos={compromissos} empresas={empresas} />;
}
