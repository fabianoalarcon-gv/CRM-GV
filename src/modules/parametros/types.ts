import type { CompromissoTipo } from "@/modules/calendario/types";

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
