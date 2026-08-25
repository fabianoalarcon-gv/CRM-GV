import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ParametrosAuditoriaForm } from "@/modules/parametros/components/ParametrosAuditoriaForm";
import { ParametrosEmailForm } from "@/modules/parametros/components/ParametrosEmailForm";
import { ParametrosGoogleCalendarForm } from "@/modules/parametros/components/ParametrosGoogleCalendarForm";
import { ParametrosNotificacaoForm } from "@/modules/parametros/components/ParametrosNotificacaoForm";
import { ParametrosRetomadaLeadForm } from "@/modules/parametros/components/ParametrosRetomadaLeadForm";
import {
  getParametrosAuditoria,
  getParametrosEmail,
  getParametrosGoogleCalendar,
  getParametrosNotificacao,
  getParametrosRetomadaLead,
} from "@/modules/parametros/queries";
import { getCurrentUser } from "@/lib/auth/profile";

export default async function ParametrosPage() {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "admin") redirect("/");

  const [
    parametrosNotificacao,
    parametrosRetomadaLead,
    parametrosEmail,
    parametrosGoogleCalendar,
    parametrosAuditoria,
  ] = await Promise.all([
    getParametrosNotificacao(),
    getParametrosRetomadaLead(),
    getParametrosEmail(),
    getParametrosGoogleCalendar(),
    getParametrosAuditoria(),
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
            Cria automaticamente uma Ação de retomada comercial para Leads que ficam arquivados por
            tempo demais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ParametrosRetomadaLeadForm parametros={parametrosRetomadaLead} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>E-mail</CardTitle>
          <CardDescription>
            Envio de e-mails de notificação (novo Lead, nova Proposta, nova Ação, etc.) para os
            usuários do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ParametrosEmailForm parametros={parametrosEmail} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Google Calendar</CardTitle>
          <CardDescription>
            Sincronização das Ações do calendário com a agenda do Google de cada usuário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ParametrosGoogleCalendarForm parametros={parametrosGoogleCalendar} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Auditoria</CardTitle>
          <CardDescription>
            Prazo de retenção do log de ações administrativas (usuários, exclusão de Lead/Proposta/
            Empresa).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ParametrosAuditoriaForm parametros={parametrosAuditoria} />
        </CardContent>
      </Card>
    </div>
  );
}
