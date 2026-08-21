import type { CompromissoTipo } from "@/modules/calendario/types";
import type { NotificacaoTipo } from "@/modules/notificacoes/types";

export interface ParametrosNotificacao {
  diasLeadSemMovimentacao: number;
  diasPropostaSemMovimentacao: number;
  diasEmpresaSemContato: number;
  diasLeadSemAcao: number;
  diasPropostaSemAcao: number;
}

export type ParametrosNotificacaoInput = ParametrosNotificacao;

export interface ParametrosRetomadaLead {
  dias: number;
  categoria: CompromissoTipo;
}

export type ParametrosRetomadaLeadInput = ParametrosRetomadaLead;

export interface ParametrosEmail {
  ativo: boolean;
  nomeRemetente: string;
  modoTeste: boolean;
  emailTeste: string | null;
  tiposHabilitados: NotificacaoTipo[];
}

export type ParametrosEmailInput = ParametrosEmail;

export interface ParametrosGoogleCalendar {
  ativo: boolean;
}

export type ParametrosGoogleCalendarInput = ParametrosGoogleCalendar;
