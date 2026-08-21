import type { NotificacaoTipo } from "./types";

export const NOTIFICACAO_TIPO_LABEL: Record<NotificacaoTipo, string> = {
  nova_empresa: "Nova empresa cadastrada",
  novo_lead: "Novo Lead cadastrado",
  nova_proposta: "Nova Proposta cadastrada",
  movimentacao_card: "Movimentação de card (Lead/Proposta)",
  proposta_aprovada: "Proposta aprovada",
  proposta_reprovada: "Proposta reprovada",
  nova_acao: "Nova Ação do calendário",
  lead_sem_movimentacao: "Lead sem movimentação",
  proposta_sem_movimentacao: "Proposta sem movimentação",
  empresa_sem_contato: "Empresa sem contato cadastrado",
  lead_sem_acao: "Lead sem Ação",
  proposta_sem_acao: "Proposta sem Ação",
};

export const NOTIFICACAO_TIPO_OPTIONS: { value: NotificacaoTipo; label: string }[] = Object.entries(
  NOTIFICACAO_TIPO_LABEL,
).map(([value, label]) => ({
  value: value as NotificacaoTipo,
  label,
}));
