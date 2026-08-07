import { notFound } from "next/navigation";
import { ClienteDetailView } from "@/modules/clientes/components/ClienteDetailView";
import {
  getClienteById,
  getContatosByCliente,
  getInteracoesByCliente,
  getPropostasByCliente,
} from "@/modules/clientes/queries";

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const clienteId = Number(id);
  if (!Number.isInteger(clienteId)) notFound();

  const cliente = await getClienteById(clienteId);
  if (!cliente) notFound();

  const [contatos, propostas, interacoes] = await Promise.all([
    getContatosByCliente(clienteId),
    getPropostasByCliente(clienteId),
    getInteracoesByCliente(clienteId),
  ]);

  return (
    <ClienteDetailView
      cliente={cliente}
      initialContatos={contatos}
      propostas={propostas}
      initialInteracoes={interacoes}
    />
  );
}
