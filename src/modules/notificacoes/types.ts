export type NotificacaoTipo =
  | "nova_empresa"
  | "novo_lead"
  | "nova_proposta"
  | "movimentacao_card"
  | "proposta_aprovada"
  | "proposta_reprovada"
  | "nova_acao"
  | "lead_sem_movimentacao"
  | "proposta_sem_movimentacao"
  | "empresa_sem_contato"
  | "lead_sem_acao"
  | "proposta_sem_acao";

export interface Notificacao {
  id: number;
  tipo: NotificacaoTipo;
  mensagem: string;
  empresaId: number | null;
  propostaId: number | null;
  compromissoId: number | null;
  createdAt: string;
  autorNome: string | null;
}
