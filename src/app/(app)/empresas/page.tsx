import { EmpresasTable } from "@/modules/empresas/components/EmpresasTable";
import { ExportEmpresasButton } from "@/modules/empresas/components/ExportEmpresasButton";
import { NewEmpresaButton } from "@/modules/empresas/components/NewEmpresaButton";
import { getEmpresas } from "@/modules/empresas/queries";

export default async function EmpresasPage() {
  const empresas = await getEmpresas();

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">
            Empresas
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
            Gestão de Empresas
          </h1>
          <p className="mt-1 text-sm font-semibold text-brand-graphite-light">
            Gerencie sua base de empresas e parceiros · {empresas.length}{" "}
            {empresas.length === 1 ? "empresa cadastrada" : "empresas cadastradas"}
          </p>
        </div>
        <div className="flex w-full gap-3 md:w-auto">
          <ExportEmpresasButton empresas={empresas} />
          <NewEmpresaButton />
        </div>
      </div>

      <EmpresasTable empresas={empresas} />
    </div>
  );
}
