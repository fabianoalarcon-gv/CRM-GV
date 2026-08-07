import { ClientesTable } from "@/modules/clientes/components/ClientesTable";
import { ExportClientesButton } from "@/modules/clientes/components/ExportClientesButton";
import { NewClienteButton } from "@/modules/clientes/components/NewClienteButton";
import { getClientes } from "@/modules/clientes/queries";

export default async function ClientesPage() {
  const clientes = await getClientes();

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">
            Clientes
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
            Gestão de Clientes
          </h1>
          <p className="mt-1 text-sm text-brand-graphite-light">
            Gerencie a base de empresas e parceiros da Granvale Logística ·{" "}
            {clientes.length} {clientes.length === 1 ? "cliente cadastrado" : "clientes cadastrados"}
          </p>
        </div>
        <div className="flex w-full gap-3 md:w-auto">
          <ExportClientesButton clientes={clientes} />
          <NewClienteButton />
        </div>
      </div>

      <ClientesTable clientes={clientes} />
    </div>
  );
}
