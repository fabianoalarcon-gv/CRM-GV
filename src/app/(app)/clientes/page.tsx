import { ClientesTable } from "@/modules/clientes/components/ClientesTable";
import { getClientes } from "@/modules/clientes/queries";

export default async function ClientesPage() {
  const clientes = await getClientes();

  return (
    <div className="flex h-full flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">
          Clientes
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          Clientes e Empresas
        </h1>
        <p className="mt-1 text-sm text-brand-graphite-light">
          {clientes.length} {clientes.length === 1 ? "cliente cadastrado" : "clientes cadastrados"}
        </p>
      </div>

      <ClientesTable clientes={clientes} />
    </div>
  );
}
