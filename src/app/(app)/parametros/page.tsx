import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ParametrosNotificacaoForm } from "@/modules/parametros/components/ParametrosNotificacaoForm";
import { ParametrosRetomadaLeadForm } from "@/modules/parametros/components/ParametrosRetomadaLeadForm";
import { getParametrosNotificacao, getParametrosRetomadaLead } from "@/modules/parametros/queries";
import { getCurrentUser } from "@/lib/auth/profile";

export default async function ParametrosPage() {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "admin") redirect("/");

  const [parametrosNotificacao, parametrosRetomadaLead] = await Promise.all([
    getParametrosNotificacao(),
    getParametrosRetomadaLead(),
  ]);

  return (
    <div className="flex h-full flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">
          Administração
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          Parâmetros
        </h1>
        <p className="mt-1 text-sm text-brand-graphite-light">Configurações gerais do sistema.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
          <CardDescription>
            Prazos, em dias, para alertar sobre inatividade de Leads, Propostas e Empresas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ParametrosNotificacaoForm parametros={parametrosNotificacao} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Retomada de Leads Arquivados</CardTitle>
          <CardDescription>
            Cria automaticamente uma Ação de retomada comercial para Leads que ficam arquivados
            por tempo demais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ParametrosRetomadaLeadForm parametros={parametrosRetomadaLead} />
        </CardContent>
      </Card>
    </div>
  );
}
