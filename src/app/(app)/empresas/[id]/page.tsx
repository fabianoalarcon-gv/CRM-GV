import { notFound } from "next/navigation";
import { EmpresaDetailView } from "@/modules/empresas/components/EmpresaDetailView";
import {
  getEmpresaById,
  getContatosByEmpresa,
  getInteracoesByEmpresa,
  getPropostasByEmpresa,
} from "@/modules/empresas/queries";

export default async function EmpresaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const empresaId = Number(id);
  if (!Number.isInteger(empresaId)) notFound();

  const empresa = await getEmpresaById(empresaId);
  if (!empresa) notFound();

  const [contatos, propostas, interacoes] = await Promise.all([
    getContatosByEmpresa(empresaId),
    getPropostasByEmpresa(empresaId),
    getInteracoesByEmpresa(empresaId),
  ]);

  return (
    <EmpresaDetailView
      empresa={empresa}
      initialContatos={contatos}
      propostas={propostas}
      initialInteracoes={interacoes}
    />
  );
}
