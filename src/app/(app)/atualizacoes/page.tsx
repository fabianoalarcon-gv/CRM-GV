import { redirect } from "next/navigation";
import { AtualizacoesList } from "@/modules/atualizacoes/components/AtualizacoesList";
import { NovaAtualizacaoButton } from "@/modules/atualizacoes/components/NovaAtualizacaoButton";
import { getAtualizacoes } from "@/modules/atualizacoes/queries";
import { getCurrentUser } from "@/lib/auth/profile";

export default async function AtualizacoesPage() {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "admin") redirect("/");

  const atualizacoes = await getAtualizacoes();

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">
            Administração
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
            Atualizações
          </h1>
          <p className="mt-1 text-sm text-brand-graphite-light">
            Cadastro de patches e itens de atualização do sistema.
          </p>
        </div>
        <NovaAtualizacaoButton />
      </div>

      <AtualizacoesList atualizacoes={atualizacoes} />
    </div>
  );
}
